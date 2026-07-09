import { useEffect, useRef } from 'react';
import {
  BALANCE_MASK,
  formatMoney,
  formatPercent,
  formatShares,
  formatSignedMoney,
} from '../../../lib/formatters';
import { HOLDING_STATUS, type EnrichedHolding } from '../../../lib/portfolio';
import { getSectorColor } from '../../../lib/sectorColors';
import styles from './HoldingCard.module.css';

function GainLoss({ holding }: { holding: EnrichedHolding }) {
  if (holding.status !== HOLDING_STATUS.ACTIVE) return null;
  const losing = holding.gainValue < 0;
  return (
    <span className={losing ? styles.gainDown : styles.gainUp}>
      {formatSignedMoney(holding.gainValue)} (
      {formatPercent(holding.gainPercent, { signed: true })})
    </span>
  );
}

interface HoldingCardProps {
  holding: EnrichedHolding;
  hideBalances: boolean;
  highlighted?: boolean;
}

export default function HoldingCard({
  holding,
  hideBalances,
  highlighted = false,
}: HoldingCardProps) {
  const sectorColor = getSectorColor(holding.sector);
  const isClosed = holding.status === HOLDING_STATUS.CLOSED;
  const priceUnavailable = holding.status === HOLDING_STATUS.PRICE_UNAVAILABLE;
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  return (
    <li
      ref={ref}
      className={`${styles.card} ${isClosed ? styles.cardClosed : ''} ${
        highlighted ? styles.highlight : ''
      }`}
    >
      <span
        className={styles.avatar}
        style={{ backgroundColor: `${sectorColor}1a`, color: sectorColor }}
        aria-hidden="true"
      >
        {holding.ticker.slice(0, 2)}
      </span>

      <div className={styles.identity}>
        <span className={styles.ticker}>{holding.ticker}</span>
        <span className={styles.name}>{holding.name}</span>
        <span className={styles.mobileShares}>
          {isClosed ? '0' : formatShares(holding.shares)} shares
        </span>
      </div>

      <div className={styles.shares}>
        <span className={styles.metaLabel}>Shares</span>
        <span className={styles.metaValue}>
          {isClosed ? '0' : formatShares(holding.shares)}
        </span>
      </div>

      <div className={styles.valuation}>
        {holding.status === HOLDING_STATUS.ACTIVE && (
          <>
            <span className={styles.value}>
              {hideBalances ? BALANCE_MASK : formatMoney(holding.marketValue)}
            </span>
            <GainLoss holding={holding} />
          </>
        )}
        {priceUnavailable && (
          <>
            <span className={styles.valueMuted}>Not priced</span>
            <span
              className={styles.noticeBadge}
              data-tooltip="Live price feed is temporarily unavailable for this stock"
              data-tooltip-pos="end"
            >
              Price unavailable
            </span>
          </>
        )}
        {isClosed && (
          <>
            <span className={styles.valueMuted}>{formatMoney(0)}</span>
            <span
              className={styles.closedBadge}
              data-tooltip="You've sold out of this position — kept for your history"
              data-tooltip-pos="end"
            >
              No open position
            </span>
          </>
        )}
      </div>
    </li>
  );
}
