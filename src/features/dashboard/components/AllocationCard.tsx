import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BALANCE_MASK, formatMoney, formatPercent } from '../../../lib/formatters';
import type { SectorAllocation } from '../../../lib/portfolio';
import { getSectorColor } from '../../../lib/sectorColors';
import styles from './AllocationCard.module.css';

interface AllocationCardProps {
  allocation: SectorAllocation[];
  hideBalances: boolean;
}

// Keep the tooltip within the card even for edge segments.
const clampCenter = (value: number) => Math.min(0.85, Math.max(0.15, value));

export default function AllocationCard({ allocation, hideBalances }: AllocationCardProps) {
  // Recharts renders the stacked bar; we track the hovered segment ourselves
  // and draw our own tooltip, because Recharts shares a single tooltip across
  // the one category and can't report which segment the pointer is over.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartRow = [
    allocation.reduce<Record<string, string | number>>(
      (row, entry) => ({ ...row, [entry.sector]: entry.value }),
      { name: 'allocation' },
    ),
  ];

  // Cumulative centre (0..1) of each segment, for tooltip placement.
  const centers = useMemo(() => {
    let offset = 0;
    return allocation.map((entry) => {
      const center = offset + entry.share / 2;
      offset += entry.share;
      return center;
    });
  }, [allocation]);

  const lastIndex = allocation.length - 1;
  const totalPositions = allocation.reduce((sum, entry) => sum + entry.positions, 0);
  const top = allocation[0];
  const active = activeIndex === null ? null : allocation[activeIndex];

  return (
    <section className={styles.card} aria-label="Asset allocation">
      <h2 className={styles.title}>Asset Allocation</h2>
      <p className={styles.caption}>By sector, share of current value</p>

      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={40}>
          <BarChart
            data={chartRow}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            {allocation.map((entry, index) => (
              <Bar
                key={entry.sector}
                dataKey={entry.sector}
                stackId="portfolio"
                fill={getSectorColor(entry.sector)}
                fillOpacity={activeIndex !== null && activeIndex !== index ? 0.45 : 1}
                barSize={22}
                radius={
                  index === 0
                    ? [11, 0, 0, 11]
                    : index === lastIndex
                      ? [0, 11, 11, 0]
                      : 0
                }
                isAnimationActive={false}
                onMouseEnter={() => setActiveIndex(index)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {active && (
          <div
            className={styles.tooltip}
            style={{ left: `${clampCenter(centers[activeIndex!]) * 100}%` }}
            role="status"
          >
            <strong>{active.sector}</strong>
            <span>
              {hideBalances ? BALANCE_MASK : formatMoney(active.value)} ·{' '}
              {formatPercent(active.share)}
            </span>
          </div>
        )}
      </div>

      <ul className={styles.legend}>
        {allocation.map((entry, index) => (
          <li
            key={entry.sector}
            className={styles.legendItem}
            data-active={activeIndex === index}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className={styles.dot}
              style={{ backgroundColor: getSectorColor(entry.sector) }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{entry.sector}</span>
            <span className={styles.legendValue}>{formatPercent(entry.share)}</span>
          </li>
        ))}
      </ul>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Holdings</dt>
          <dd>{totalPositions}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Sectors</dt>
          <dd>{allocation.length}</dd>
        </div>
        <div className={`${styles.stat} ${styles.statWide}`}>
          <dt>Largest</dt>
          {top ? (
            <dd data-tooltip={`${top.sector} · ${formatPercent(top.share)}`}>
              {top.sector} · {formatPercent(top.share)}
            </dd>
          ) : (
            <dd>—</dd>
          )}
        </div>
      </dl>
    </section>
  );
}
