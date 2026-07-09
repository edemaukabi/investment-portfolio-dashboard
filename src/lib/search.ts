import type { EnrichedHolding } from './portfolio';
import type { Transaction, TransactionStatus, TransactionType } from '../types';

/**
 * A flat, tagged result for the top-bar quick search. Every result belongs
 * to exactly one destination tab — a query that matches a company in both
 * Stocks and Orders yields separate rows, one per source, each labelled, so
 * the user picks the context they want rather than us guessing.
 */
export type SearchResult =
  | {
      kind: 'stock';
      id: string;
      ticker: string;
      name: string;
      sector: string;
    }
  | {
      kind: 'order';
      id: string;
      ticker: string;
      name: string;
      type: TransactionType;
      date: string;
      status: TransactionStatus;
    };

const PER_GROUP_LIMIT = 5;

function score(query: string, ticker: string, name: string): number {
  const t = ticker.toLowerCase();
  const n = name.toLowerCase();
  if (t === query) return 0;
  if (t.startsWith(query)) return 1;
  if (n.startsWith(query)) return 2;
  if (t.includes(query) || n.includes(query)) return 3;
  return Infinity;
}

export function searchPortfolio(
  query: string,
  holdings: EnrichedHolding[],
  transactions: Transaction[],
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const stocks: SearchResult[] = holdings
    .map((h) => ({ h, rank: score(q, h.ticker, h.name) }))
    .filter((x) => x.rank !== Infinity)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, PER_GROUP_LIMIT)
    .map(({ h }) => ({
      kind: 'stock',
      id: h.id,
      ticker: h.ticker,
      name: h.name,
      sector: h.sector,
    }));

  const orders: SearchResult[] = transactions
    .map((t) => ({ t, rank: score(q, t.ticker, t.name) }))
    .filter((x) => x.rank !== Infinity)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, PER_GROUP_LIMIT)
    .map(({ t }) => ({
      kind: 'order',
      id: t.id,
      ticker: t.ticker,
      name: t.name,
      type: t.type,
      date: t.date,
      status: t.status,
    }));

  return [...stocks, ...orders];
}
