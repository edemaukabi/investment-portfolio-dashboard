import { useState } from 'react';
import { MenuIcon, SearchIcon, BellIcon, HelpCircleIcon, CloseIcon } from '../../../components/icons';
import QuickSearch from './QuickSearch';
import { useInfoDialog } from '../../../components/InfoDialog';
import { formatDate } from '../../../lib/formatters';
import type { SearchResult } from '../../../lib/search';
import type { EnrichedHolding } from '../../../lib/portfolio';
import type { Session } from '../../../services/authService';
import type { Transaction } from '../../../types';
import styles from './Topbar.module.css';

interface TopbarProps {
  user: Session;
  lastUpdated?: string;
  onOpenSidebar: () => void;
  holdings: EnrichedHolding[];
  transactions: Transaction[];
  onSelectResult: (result: SearchResult) => void;
}

export default function Topbar({
  user,
  lastUpdated,
  onOpenSidebar,
  holdings,
  transactions,
  onSelectResult,
}: TopbarProps) {
  const { showDialog, showComingSoon } = useInfoDialog();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const firstName = user.name.split(' ')[0];

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <MenuIcon size={20} />
      </button>

      <div className={styles.headings}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Welcome back, {firstName}
          {lastUpdated && ` · updated ${formatDate(lastUpdated)}`}
        </p>
      </div>

      <div className={styles.search}>
        <QuickSearch
          holdings={holdings}
          transactions={transactions}
          onSelect={onSelectResult}
        />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton + ' ' + styles.mobileSearchButton}
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Search"
          data-tooltip="Search"
        >
          <SearchIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => showComingSoon('Notifications')}
          aria-label="Notifications"
          data-tooltip="Notifications"
        >
          <BellIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() =>
            showDialog({
              variant: 'info',
              title: 'About this demo',
              message:
                'Trove is a portfolio dashboard demo with simulated data. ' +
                'Search your stocks and orders from the top bar, hide your ' +
                'balances, filter your holdings, and switch the chart range.',
            })
          }
          aria-label="Help"
          data-tooltip="Help"
          data-tooltip-pos="end"
        >
          <HelpCircleIcon size={18} />
        </button>
      </div>

      {mobileSearchOpen && (
        <div className={styles.mobileSearch}>
          <QuickSearch
            holdings={holdings}
            transactions={transactions}
            onSelect={onSelectResult}
            autoFocus
            onDismiss={() => setMobileSearchOpen(false)}
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Close search"
          >
            <CloseIcon size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
