import { BALANCE_MASK, formatMoney, formatPercent } from '../../../lib/formatters';
import type { SectorAllocation } from '../../../lib/portfolio';
import { getSectorColor } from '../../../lib/sectorColors';
import styles from './AccountSummary.module.css';

interface AccountSummaryProps {
  accounts: SectorAllocation[];
  hideBalances: boolean;
}

export default function AccountSummary({ accounts, hideBalances }: AccountSummaryProps) {
  return (
    <section aria-label="Accounts by sector">
      <h2 className={styles.heading}>Accounts</h2>
      <div className={styles.grid}>
        {accounts.map((account) => {
          const gaining = account.gainPercent >= 0;
          return (
            <article key={account.sector} className={styles.card}>
              <div className={styles.cardHeader}>
                <span
                  className={styles.dot}
                  style={{ backgroundColor: getSectorColor(account.sector) }}
                  aria-hidden="true"
                />
                <span className={styles.name}>{account.sector}</span>
              </div>
              <p className={styles.positions}>
                {account.positions} position{account.positions === 1 ? '' : 's'}
              </p>
              <p className={styles.value}>
                {hideBalances ? BALANCE_MASK : formatMoney(account.value)}
              </p>
              <span className={gaining ? styles.changeUp : styles.changeDown}>
                {formatPercent(account.gainPercent, { signed: true })}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
