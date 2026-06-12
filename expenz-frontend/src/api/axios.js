// src/api/axios.js
import axios from 'axios';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// VITE_API_URL must be set in .env / Vercel environment variables:
//   VITE_API_URL=https://expenz-ag3g.onrender.com/api
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://expenz-ag3g.onrender.com/api');

// ─── Axios instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL        : BASE_URL,
  withCredentials: true,          // ✅ required — sends Authorization header cross-origin
  timeout        : 20_000,        // 20 s — Render free tier can take ~15 s to wake
  headers        : {
    'Content-Type': 'application/json',
    'X-Api-Version': '1',
  },
});

// ─── Request interceptor — attach JWT ────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expenz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { config, response } = error;

    // ── 401 — token expired or invalid → hard logout ─────────────────────────
    if (response?.status === 401) {
      localStorage.removeItem('expenz_token');
      localStorage.removeItem('expenz_user');
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // ── Retry on network failure (cold-start / transient) ────────────────────
    // Retry once automatically when:
    //   • No response received at all (CORS preflight failure, ERR_FAILED,
    //     ERR_NETWORK, timeout)  AND
    //   • The request is idempotent (GET, HEAD, OPTIONS, PUT, DELETE)  OR
    //     explicitly marked as safe to retry.
    const isIdempotent  = ['get', 'head', 'options', 'put', 'delete']
      .includes((config?.method || '').toLowerCase());
    const isNetworkErr  = !response;                // no response at all
    const alreadyRetried = config?._retried;

    if (isNetworkErr && isIdempotent && !alreadyRetried && config) {
      config._retried = true;

      // Back off 2 s before retry — gives Render time to finish waking up
      await new Promise((r) => setTimeout(r, 2_000));

      return API(config);
    }

    return Promise.reject(error);
  }
);

export default API;