import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SearchIcon, CloseIcon, PlusIcon, MinusIcon } from '../../../components/icons';
import { searchPortfolio, type SearchResult } from '../../../lib/search';
import { formatDate } from '../../../lib/formatters';
import type { EnrichedHolding } from '../../../lib/portfolio';
import type { Transaction } from '../../../types';
import styles from './QuickSearch.module.css';

interface QuickSearchProps {
  holdings: EnrichedHolding[];
  transactions: Transaction[];
  onSelect: (result: SearchResult) => void;
  autoFocus?: boolean;
  onDismiss?: () => void;
}

function resultKey(result: SearchResult) {
  return `${result.kind}-${result.id}`;
}

export default function QuickSearch({
  holdings,
  transactions,
  onSelect,
  autoFocus,
  onDismiss,
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(
    () => searchPortfolio(query, holdings, transactions),
    [query, holdings, transactions],
  );

  // Keep the active row in range as results change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close on click outside.
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const showDropdown = open && query.trim().length > 0;

  function choose(result: SearchResult) {
    onSelect(result);
    setQuery('');
    setOpen(false);
    onDismiss?.();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (query) {
        setQuery('');
      } else {
        onDismiss?.();
      }
      setOpen(false);
      return;
    }
    if (!showDropdown || results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const chosen = results[activeIndex];
      if (chosen) choose(chosen);
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputRow}>
        <SearchIcon size={16} className={styles.icon} />
        <input
          type="search"
          className={styles.input}
          placeholder="Search stocks, crypto…"
          value={query}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-activedescendant={
            showDropdown && results[activeIndex]
              ? `${listId}-${resultKey(results[activeIndex])}`
              : undefined
          }
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length === 0 ? (
            <p className={styles.empty}>No stocks or orders match “{query.trim()}”.</p>
          ) : (
            <ul className={styles.list} id={listId} role="listbox">
              {results.map((result, index) => {
                const isBuy = result.kind === 'order' && result.type === 'BUY';
                return (
                  <li key={resultKey(result)} role="presentation">
                    <button
                      type="button"
                      id={`${listId}-${resultKey(result)}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={
                        index === activeIndex ? styles.optionActive : styles.option
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(result)}
                    >
                      <span
                        className={
                          result.kind === 'stock'
                            ? styles.stockMark
                            : isBuy
                              ? styles.buyMark
                              : styles.sellMark
                        }
                        aria-hidden="true"
                      >
                        {result.kind === 'stock' ? (
                          result.ticker.slice(0, 2)
                        ) : isBuy ? (
                          <PlusIcon size={13} />
                        ) : (
                          <MinusIcon size={13} />
                        )}
                      </span>

                      <span className={styles.optionMain}>
                        <span className={styles.optionTitle}>
                          {result.kind === 'stock'
                            ? result.ticker
                            : `${isBuy ? 'Buy' : 'Sell'} ${result.name}`}
                        </span>
                        <span className={styles.optionSub}>
                          {result.kind === 'stock'
                            ? result.name
                            : `${formatDate(result.date)} · ${
                                result.status.charAt(0) +
                                result.status.slice(1).toLowerCase()
                              }`}
                        </span>
                      </span>

                      <span
                        className={
                          result.kind === 'stock' ? styles.tagStock : styles.tagOrder
                        }
                      >
                        {result.kind === 'stock' ? 'Stock' : 'Order'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className={styles.hint}>
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate · <kbd>↵</kbd> to open
          </p>
        </div>
      )}
    </div>
  );
}
