import type { Holding, PortfolioData, PortfolioUser, Transaction } from '../types';

/**
 * Pure derivations over the raw portfolio payload. Everything here is
 * synchronous and side-effect free so it can be unit-tested in isolation
 * and memoised cheaply in components.
 */

export const HOLDING_STATUS = {
  ACTIVE: 'active',
  // currentPrice is 0/missing — we can't value the position (NVDA)
  PRICE_UNAVAILABLE: 'price-unavailable',
  // 0 shares — a closed position kept for history (DIS)
  CLOSED: 'closed',
} as const;

export type HoldingStatus = (typeof HOLDING_STATUS)[keyof typeof HOLDING_STATUS];

/**
 * Discriminated on `status`: valuation figures exist if and only if the
 * holding is active, so the compiler rejects any code path that reads a
 * gain/loss off NVDA (no price) or DIS (no shares).
 */
export type ActiveHolding = Holding & {
  status: typeof HOLDING_STATUS.ACTIVE;
  marketValue: number;
  costBasis: number;
  gainValue: number;
  gainPercent: number;
};

export type InactiveHolding = Holding & {
  status: typeof HOLDING_STATUS.PRICE_UNAVAILABLE | typeof HOLDING_STATUS.CLOSED;
  marketValue: null;
  costBasis: null;
  gainValue: null;
  gainPercent: null;
};

export type EnrichedHolding = ActiveHolding | InactiveHolding;

export interface SectorAllocation {
  sector: string;
  value: number;
  costBasis: number;
  positions: number;
  share: number;
  gainPercent: number;
}

export interface DerivedPortfolio {
  user: PortfolioUser;
  holdings: EnrichedHolding[];
  netWorth: number;
  totalGainValue: number;
  totalGainPercent: number;
  allocation: SectorAllocation[];
  excludedHoldings: InactiveHolding[];
  sectors: string[];
  transactions: Transaction[];
}

function enrichHolding(holding: Holding): EnrichedHolding {
  const inactive = {
    marketValue: null,
    costBasis: null,
    gainValue: null,
    gainPercent: null,
  } as const;

  if (holding.shares <= 0) {
    return { ...holding, status: HOLDING_STATUS.CLOSED, ...inactive };
  }
  if (holding.currentPrice <= 0) {
    return { ...holding, status: HOLDING_STATUS.PRICE_UNAVAILABLE, ...inactive };
  }

  const marketValue = holding.shares * holding.currentPrice;
  const costBasis = holding.shares * holding.avgCost;
  const gainValue = marketValue - costBasis;
  const gainPercent = costBasis > 0 ? gainValue / costBasis : 0;

  return {
    ...holding,
    status: HOLDING_STATUS.ACTIVE,
    marketValue,
    costBasis,
    gainValue,
    gainPercent,
  };
}

// Display order: largest positions first, then unpriced, closed last.
const DISPLAY_RANK: Record<HoldingStatus, number> = {
  [HOLDING_STATUS.ACTIVE]: 0,
  [HOLDING_STATUS.PRICE_UNAVAILABLE]: 1,
  [HOLDING_STATUS.CLOSED]: 2,
};

export function derivePortfolio(data: PortfolioData): DerivedPortfolio {
  const holdings = data.holdings
    .map(enrichHolding)
    .sort(
      (a, b) =>
        DISPLAY_RANK[a.status] - DISPLAY_RANK[b.status] ||
        (b.marketValue ?? 0) - (a.marketValue ?? 0),
    );
  const activeHoldings = holdings.filter(
    (h): h is ActiveHolding => h.status === HOLDING_STATUS.ACTIVE,
  );

  const netWorth = activeHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCost = activeHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGainValue = netWorth - totalCost;
  const totalGainPercent = totalCost > 0 ? totalGainValue / totalCost : 0;

  const excludedHoldings = holdings.filter(
    (h): h is InactiveHolding => h.status !== HOLDING_STATUS.ACTIVE,
  );

  // One grouping serves both the allocation bar and the account cards.
  const sectorMap = new Map<
    string,
    { sector: string; value: number; costBasis: number; positions: number }
  >();
  for (const holding of activeHoldings) {
    const entry = sectorMap.get(holding.sector) ?? {
      sector: holding.sector,
      value: 0,
      costBasis: 0,
      positions: 0,
    };
    entry.value += holding.marketValue;
    entry.costBasis += holding.costBasis;
    entry.positions += 1;
    sectorMap.set(holding.sector, entry);
  }

  const allocation: SectorAllocation[] = [...sectorMap.values()]
    .map((entry) => ({
      ...entry,
      share: netWorth > 0 ? entry.value / netWorth : 0,
      gainPercent:
        entry.costBasis > 0 ? (entry.value - entry.costBasis) / entry.costBasis : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const sectors = [...new Set(holdings.map((h) => h.sector))];

  // Newest activity first — don't trust the payload's ordering.
  const transactions = [...data.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return {
    user: data.user,
    holdings,
    netWorth,
    totalGainValue,
    totalGainPercent,
    allocation,
    excludedHoldings,
    sectors,
    transactions,
  };
}
