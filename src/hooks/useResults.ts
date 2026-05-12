import { useState, useEffect } from 'react';
import { ResultsData } from '../types';

interface UseResultsState {
  data: ResultsData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and manage results.json data
 */
export function useResults(): UseResultsState {
  const [state, setState] = useState<UseResultsState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/data/results.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.statusText}`);
        }
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState({ data: null, loading: false, error: errorMessage });
      }
    };

    fetchResults();
  }, []);

  return state;
}
