import { useEffect, useMemo, useRef, useState } from 'react';
import FilterPills from '../../../components/FilterPills';
import StatusBadge from '../../../components/StatusBadge';
import { PlusIcon, MinusIcon } from '../../../components/icons';
import {
  BALANCE_MASK,
  formatDate,
  formatMoney,
  formatShares,
} from '../../../lib/formatters';
import type { Transaction } from '../../../types';
import styles from './OrdersPanel.module.css';

const TYPE_FILTERS = ['All', 'Buy', 'Sell'] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

function amountClass(transaction: Transaction): string {
  if (transaction.status === 'FAILED') return styles.amountFailed;
  if (transaction.status === 'PENDING') return styles.amountPending;
  return transaction.type === 'SELL' ? styles.amountIn : styles.amountOut;
}

function formatAmount(transaction: Transaction, hideBalances: boolean): string {
  if (hideBalances) return BALANCE_MASK;
  // Buys move money out of the account, sells bring money in.
  const sign = transaction.type === 'SELL' ? '+' : '−';
  return `${sign}${formatMoney(transaction.totalAmount)}`;
}

interface OrdersPanelProps {
  transactions: Transaction[];
  hideBalances: boolean;
  highlightId: string | null;
}

export default function OrdersPanel({
  transactions,
  hideBalances,
  highlightId,
}: OrdersPanelProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const highlightRef = useRef<HTMLLIElement>(null);

  // A quick-search jump must land on the row even if a Buy/Sell filter is on.
  useEffect(() => {
    if (!highlightId) return;
    setTypeFilter('All');
    // Wait for the filter reset to render before scrolling.
    const frame = requestAnimationFrame(() => {
      highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightId]);

  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'All') return transactions;
    return transactions.filter((t) => t.type === typeFilter.toUpperCase());
  }, [transactions, typeFilter]);

  return (
    <div>
      <div className={styles.controls}>
        <FilterPills
          options={TYPE_FILTERS}
          value={typeFilter}
          onChange={setTypeFilter}
          label="Filter transactions by type"
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <p className={styles.empty}>No {typeFilter.toLowerCase()} transactions.</p>
      ) : (
        <ul className={styles.list}>
          {filteredTransactions.map((transaction) => {
            const isBuy = transaction.type === 'BUY';
            const isHighlighted = transaction.id === highlightId;
            return (
              <li
                key={transaction.id}
                ref={isHighlighted ? highlightRef : undefined}
                className={`${styles.row} ${isHighlighted ? styles.highlight : ''}`}
              >
                <span
                  className={isBuy ? styles.iconBuy : styles.iconSell}
                  aria-hidden="true"
                >
                  {isBuy ? <PlusIcon size={15} /> : <MinusIcon size={15} />}
                </span>

                <div className={styles.details}>
                  <span className={styles.name}>
                    {isBuy ? 'Buy' : 'Sell'} {transaction.name}
                  </span>
                  <span className={styles.meta}>
                    {formatDate(transaction.date)} ·{' '}
                    {formatShares(transaction.shares)} shares @{' '}
                    {formatMoney(transaction.pricePerShare)}
                  </span>
                </div>

                <div className={styles.right}>
                  <span className={amountClass(transaction)}>
                    {formatAmount(transaction, hideBalances)}
                  </span>
                  <StatusBadge status={transaction.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
