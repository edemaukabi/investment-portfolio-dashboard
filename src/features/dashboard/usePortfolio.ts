import { useCallback, useEffect, useState } from 'react';
import { fetchPortfolio } from '../../services/portfolioService';
import type { PortfolioData } from '../../types';

type RequestStatus = 'loading' | 'error' | 'ready';

interface UsePortfolioResult {
  data: PortfolioData | null;
  status: RequestStatus;
  error: Error | null;
  retry: () => void;
}

/**
 * Loads the portfolio through the service layer and exposes
 * loading / error / ready states plus a retry.
 */
export default function usePortfolio(): UsePortfolioResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchPortfolio()
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, status, error, retry };
}
