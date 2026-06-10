// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import API from '../api/axios';
import { useToast } from './useToast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const request = useCallback(async (method, url, data = null, successMsg = null) => {
    setLoading(true);
    try {
      const config = { method, url };
      if (data) config.data = data;
      const res = await API(config);
      if (successMsg) addToast(successMsg, 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      addToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return { loading, request };
};