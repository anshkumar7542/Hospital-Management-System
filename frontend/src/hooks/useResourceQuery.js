import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../services/apiClient.js';
import { resourceService } from '../services/resourceService.js';
import { useResourceCacheStore } from '../store/resourceCacheStore.js';
import { useToastStore } from '../store/toastStore.js';

const CACHE_TTL = 60_000;

export function useResourceQuery(type, initialParams = {}) {
  const [params, setParams] = useState({ page: 1, limit: 10, search: '', sortBy: 'id', sortOrder: 'desc', ...initialParams });
  const [state, setState] = useState({ rows: [], meta: null, status: 'idle', error: null });
  const { getCache, setCache, invalidate } = useResourceCacheStore();
  const pushToast = useToastStore((store) => store.pushToast);

  const cacheKey = useMemo(() => `${type}:${JSON.stringify(params)}`, [type, params]);

  const fetchData = useCallback(
    async ({ force = false } = {}) => {
      const cached = getCache(cacheKey);
      if (!force && cached && Date.now() - cached.cachedAt < CACHE_TTL) {
        setState({ rows: cached.rows, meta: cached.meta, status: 'success', error: null });
        return;
      }

      setState((current) => ({ ...current, status: current.rows.length ? 'refreshing' : 'loading', error: null }));
      try {
        const result = await resourceService.list(type, params);
        setCache(cacheKey, result);
        setState({ rows: result.rows, meta: result.meta, status: 'success', error: null });
      } catch (error) {
        setState((current) => ({ ...current, status: 'error', error: getApiErrorMessage(error) }));
      }
    },
    [cacheKey, getCache, params, setCache, type]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (patch) => {
    setParams((current) => ({ ...current, ...patch, page: patch.page || 1 }));
  };

  const optimisticCreate = async (payload) => {
    const tempRecord = { id: `tmp-${crypto.randomUUID()}`, ...payload, optimistic: true };
    setState((current) => ({ ...current, rows: [tempRecord, ...current.rows] }));
    try {
      await resourceService.create(type, payload);
      invalidate(`${type}:`);
      await fetchData({ force: true });
      pushToast({ type: 'success', title: 'Record created', message: 'The list has been updated.' });
    } catch (error) {
      setState((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== tempRecord.id) }));
      pushToast({ type: 'error', title: 'Create failed', message: getApiErrorMessage(error) });
    }
  };

  const optimisticDelete = async (id) => {
    const previousRows = state.rows;
    setState((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
    try {
      await resourceService.remove(type, id);
      invalidate(`${type}:`);
      pushToast({ type: 'success', title: 'Record deleted' });
    } catch (error) {
      setState((current) => ({ ...current, rows: previousRows }));
      pushToast({ type: 'error', title: 'Delete failed', message: getApiErrorMessage(error) });
    }
  };

  return {
    ...state,
    params,
    setParams: updateParams,
    retry: () => fetchData({ force: true }),
    optimisticCreate,
    optimisticDelete
  };
}
