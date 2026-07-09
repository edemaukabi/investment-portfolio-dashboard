import rawData from '../data/portfolio.json';
import type { PortfolioData } from '../types';

// The JSON is a trusted local fixture, so a cast at this boundary is
// enough; a real API client would validate the payload here instead.
const portfolioData = rawData as PortfolioData;

// Simulated network characteristics. Bump FAILURE_RATE (0..1) to
// exercise the dashboard's error/retry state during development.
const LATENCY_MS = 650;
const FAILURE_RATE = 0;

function simulateRequest<T>(payload: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('The portfolio service is unavailable. Please try again.'));
        return;
      }
      // Clone so consumers can never mutate the source dataset.
      resolve(structuredClone(payload));
    }, LATENCY_MS);
  });
}

export function fetchPortfolio(): Promise<PortfolioData> {
  return simulateRequest(portfolioData);
}
