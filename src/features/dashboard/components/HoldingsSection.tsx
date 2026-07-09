import { forwardRef } from 'react';
import type { EnrichedHolding } from '../../../lib/portfolio';
import type { Transaction } from '../../../types';
import StocksPanel from './StocksPanel';
import OrdersPanel from './OrdersPanel';
import styles from './HoldingsSection.module.css';

export type HoldingsTab = 'stocks' | 'orders';

const TABS: Array<{ id: HoldingsTab; label: string }> = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'orders', label: 'Orders' },
];

interface HoldingsSectionProps {
  holdings: EnrichedHolding[];
  sectors: string[];
  transactions: Transaction[];
  hideBalances: boolean;
  activeTab: HoldingsTab;
  onTabChange: (tab: HoldingsTab) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  /** Id of a holding/transaction to briefly highlight (from quick search). */
  highlightId: string | null;
}

const HoldingsSection = forwardRef<HTMLDivElement, HoldingsSectionProps>(
  function HoldingsSection(
    {
      holdings,
      sectors,
      transactions,
      hideBalances,
      activeTab,
      onTabChange,
      searchQuery,
      onSearchChange,
      highlightId,
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={styles.card}
        aria-label="Holdings and transactions"
      >
        <div className={styles.tabBar} role="tablist" aria-label="Holdings and orders">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={activeTab === tab.id ? styles.tabActive : styles.tab}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className={styles.panel}
        >
          {activeTab === 'stocks' ? (
            <StocksPanel
              holdings={holdings}
              sectors={sectors}
              hideBalances={hideBalances}
              query={searchQuery}
              onQueryChange={onSearchChange}
              highlightId={highlightId}
            />
          ) : (
            <OrdersPanel
              transactions={transactions}
              hideBalances={hideBalances}
              highlightId={highlightId}
            />
          )}
        </div>
      </section>
    );
  },
);

export default HoldingsSection;
