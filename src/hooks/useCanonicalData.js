import { useCallback, useEffect, useState } from 'react';
import { loadCanonicalData } from '../lib/platform.js';

export default function useCanonicalData(key) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const reload = useCallback(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: 'loading', error: null }));
    loadCanonicalData(key, controller.signal)
      .then((data) => setState({ status: 'ready', data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ status: 'error', data: null, error });
      });
    return controller;
  }, [key]);
  useEffect(() => {
    const controller = reload();
    return () => controller.abort();
  }, [reload]);
  return { ...state, reload };
}
