import { useMemo, useState, type ReactElement } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import {
  EyeIcon,
  EyeOffIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from '../../../components/icons';
import {
  BALANCE_MASK,
  formatMoney,
  formatPercent,
  formatShares,
  formatSignedMoney,
} from '../../../lib/formatters';
import { buildTrendSeries, TREND_RANGES, type RangeKey } from '../../../lib/performance';
import { HOLDING_STATUS, type DerivedPortfolio } from '../../../lib/portfolio';
import styles from './NetWorthCard.module.css';

interface TrendTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string }>;
  // "Hide balances" must cover hover states too, not just the static text.
  masked?: boolean;
}

function TrendTooltip({ active, payload, masked }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      {masked ? BALANCE_MASK : formatMoney(Number(payload[0].value))}
    </div>
  );
}

// A single dot marking the current (final) point on the line. Recharts calls
// this for every point, so non-final points render an empty group.
interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

function makeCurrentDot(lastIndex: number) {
  return function CurrentDot({ cx, cy, index }: DotProps): ReactElement {
    if (cx == null || cy == null || index !== lastIndex) return <g key={index} />;
    return (
      <g key={index}>
        <circle cx={cx} cy={cy} r={5.5} fill="#059a83" fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={3} fill="#059a83" stroke="#fff" strokeWidth={1.5} />
      </g>
    );
  };
}

interface NetWorthCardProps {
  portfolio: DerivedPortfolio;
  hideBalances: boolean;
  onToggleBalances: () => void;
}

export default function NetWorthCard({
  portfolio,
  hideBalances,
  onToggleBalances,
}: NetWorthCardProps) {
  const { netWorth, totalGainValue, totalGainPercent, excludedHoldings } = portfolio;
  const [range, setRange] = useState<RangeKey>('1M');

  const series = useMemo(() => buildTrendSeries(netWorth, range), [netWorth, range]);
  const rangeLabel = TREND_RANGES.find((r) => r.key === range)?.label ?? '';

  // The change indicator tracks the selected range so the headline always
  // agrees with the chart. "All time" is the true return vs. amount invested;
  // shorter ranges are the movement across the visible series.
  const { changeValue, changePercent, changeCaption } = useMemo(() => {
    if (range === 'ALL') {
      return {
        changeValue: totalGainValue,
        changePercent: totalGainPercent,
        changeCaption: 'All time · vs. amount invested',
      };
    }
    const first = series[0].value;
    const last = series[series.length - 1].value;
    const value = last - first;
    return {
      changeValue: value,
      changePercent: first > 0 ? value / first : 0,
      changeCaption: rangeLabel,
    };
  }, [range, series, totalGainValue, totalGainPercent, rangeLabel]);

  const gaining = changeValue >= 0;
  const TrendArrow = gaining ? ArrowUpRightIcon : ArrowDownRightIcon;
  const unpriced = excludedHoldings.filter(
    (h) => h.status === HOLDING_STATUS.PRICE_UNAVAILABLE,
  );

  return (
    <section className={styles.card} aria-label="Total net worth">
      <div className={styles.header}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Total Net Worth</span>
          <button
            type="button"
            className={styles.eyeButton}
            onClick={onToggleBalances}
            aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            aria-pressed={hideBalances}
            data-tooltip={hideBalances ? 'Show balances' : 'Hide balances'}
          >
            {hideBalances ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>

        <div className={styles.ranges} role="group" aria-label="Chart range">
          {TREND_RANGES.map(({ key }) => (
            <button
              key={key}
              type="button"
              className={key === range ? styles.rangeActive : styles.range}
              aria-pressed={key === range}
              onClick={() => setRange(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>
          {hideBalances ? BALANCE_MASK : formatMoney(netWorth)}
        </span>
        <span className={gaining ? styles.changeUp : styles.changeDown}>
          <TrendArrow size={14} />
          {formatPercent(changePercent, { signed: true })}
        </span>
      </div>
      <p className={styles.caption}>
        {hideBalances ? (
          changeCaption
        ) : (
          <>
            <span className={gaining ? styles.captionUp : styles.captionDown}>
              {formatSignedMoney(changeValue)}
            </span>{' '}
            · {changeCaption}
          </>
        )}
      </p>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={series} margin={{ top: 8, right: 6, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059a83" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#059a83" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Without a pinned domain the axis starts at 0 and the line looks flat */}
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip content={<TrendTooltip masked={hideBalances} />} cursor={false} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059a83"
              strokeWidth={2.2}
              fill="url(#netWorthFill)"
              isAnimationActive={false}
              dot={makeCurrentDot(series.length - 1)}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#059a83' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {unpriced.length > 0 && (
        <p className={styles.footnote}>
          Excludes{' '}
          {unpriced
            .map(
              (h) =>
                `${h.ticker} (${formatShares(h.shares)} shares · ` +
                `${hideBalances ? BALANCE_MASK : formatMoney(h.shares * h.avgCost)} invested)`,
            )
            .join(', ')}{' '}
          — live price unavailable.
        </p>
      )}
    </section>
  );
}
