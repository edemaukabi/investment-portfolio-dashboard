import { useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { derivePortfolio } from '../../lib/portfolio';
import useDocumentTitle from '../../lib/useDocumentTitle';
import type { SearchResult } from '../../lib/search';
import usePortfolio from './usePortfolio';
import ErrorState from '../../components/ErrorState';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import NetWorthCard from './components/NetWorthCard';
import AllocationCard from './components/AllocationCard';
import AccountSummary from './components/AccountSummary';
import HoldingsSection, { type HoldingsTab } from './components/HoldingsSection';
import DashboardSkeleton from './components/DashboardSkeleton';
import styles from './DashboardPage.module.css';

interface Highlight {
  tab: HoldingsTab;
  id: string;
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard · Trove');
  const { user, signOut } = useAuth();
  const { data, status, error, retry } = usePortfolio();

  const [hideBalances, setHideBalances] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The Stocks in-card search stays independent; the active tab and a
  // transient highlight are shared so top-bar quick search can jump to any
  // holding or order.
  const [stockSearch, setStockSearch] = useState('');
  const [activeTab, setActiveTab] = useState<HoldingsTab>('stocks');
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const holdingsRef = useRef<HTMLDivElement>(null);

  const portfolio = useMemo(() => (data ? derivePortfolio(data) : null), [data]);

  // The route guard guarantees a session; this narrows it for TypeScript.
  if (!user) return null;

  function goToResult(result: SearchResult) {
    const tab: HoldingsTab = result.kind === 'stock' ? 'stocks' : 'orders';
    setActiveTab(tab);
    // Clear the in-card stock filter so the target can't be filtered out.
    if (result.kind === 'stock') setStockSearch('');
    setHighlight({ tab, id: result.id });
    holdingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Clear the highlight after its pulse animation finishes.
    window.setTimeout(() => {
      setHighlight((current) =>
        current && current.id === result.id ? null : current,
      );
    }, 2600);
  }

  const highlightId =
    highlight && highlight.tab === activeTab ? highlight.id : null;

  return (
    <div className={styles.shell}>
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={signOut}
      />

      <div className={styles.main}>
        <Topbar
          user={user}
          lastUpdated={portfolio?.user.lastUpdated}
          onOpenSidebar={() => setSidebarOpen(true)}
          holdings={portfolio?.holdings ?? []}
          transactions={portfolio?.transactions ?? []}
          onSelectResult={goToResult}
        />

        <main className={styles.content}>
          {status === 'loading' && <DashboardSkeleton />}

          {status === 'error' && (
            <ErrorState
              title="We couldn't load your portfolio"
              message={error?.message ?? 'An unexpected error occurred.'}
              onRetry={retry}
            />
          )}

          {status === 'ready' && portfolio && (
            <>
              <div className={styles.overviewGrid}>
                <NetWorthCard
                  portfolio={portfolio}
                  hideBalances={hideBalances}
                  onToggleBalances={() => setHideBalances((hidden) => !hidden)}
                />
                <AllocationCard
                  allocation={portfolio.allocation}
                  hideBalances={hideBalances}
                />
              </div>

              <AccountSummary
                accounts={portfolio.allocation}
                hideBalances={hideBalances}
              />

              <HoldingsSection
                ref={holdingsRef}
                holdings={portfolio.holdings}
                sectors={portfolio.sectors}
                transactions={portfolio.transactions}
                hideBalances={hideBalances}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchQuery={stockSearch}
                onSearchChange={setStockSearch}
                highlightId={highlightId}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
