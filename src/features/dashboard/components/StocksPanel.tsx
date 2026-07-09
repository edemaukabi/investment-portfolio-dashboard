import { useMemo, useState } from 'react';
import SearchInput from '../../../components/SearchInput';
import FilterPills from '../../../components/FilterPills';
import type { EnrichedHolding } from '../../../lib/portfolio';
import HoldingCard from './HoldingCard';
import styles from './StocksPanel.module.css';

const ALL_SECTORS = 'All';

interface StocksPanelProps {
  holdings: EnrichedHolding[];
  sectors: string[];
  hideBalances: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  highlightId: string | null;
}

export default function StocksPanel({
  holdings,
  sectors,
  hideBalances,
  query,
  onQueryChange,
  highlightId,
}: StocksPanelProps) {
  const [sector, setSector] = useState(ALL_SECTORS);

  const filteredHoldings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return holdings.filter((holding) => {
      const matchesSector = sector === ALL_SECTORS || holding.sector === sector;
      const matchesQuery =
        needle === '' ||
        holding.ticker.toLowerCase().includes(needle) ||
        holding.name.toLowerCase().includes(needle);
      return matchesSector && matchesQuery;
    });
  }, [holdings, query, sector]);

  return (
    <div>
      <div className={styles.controls}>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder="Search by ticker or company name"
        />
        <FilterPills
          options={[ALL_SECTORS, ...sectors]}
          value={sector}
          onChange={setSector}
          label="Filter holdings by sector"
        />
      </div>

      <p className="visually-hidden" role="status">
        {filteredHoldings.length} of {holdings.length} holdings shown
      </p>

      {filteredHoldings.length === 0 ? (
        <div className={styles.empty}>
          <p>No holdings match your search.</p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              onQueryChange('');
              setSector(ALL_SECTORS);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filteredHoldings.map((holding) => (
            <HoldingCard
              key={holding.id}
              holding={holding}
              hideBalances={hideBalances}
              highlighted={holding.id === highlightId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
