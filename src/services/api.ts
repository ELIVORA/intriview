/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

// Fetch VITE_API_BASE_URL from meta context or map to relative proxy routing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout budget for LLM operations
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Injects active JWT session tokens
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("idToken") || localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error mapper & intercept triggers
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle unauthorized states (Token Expiry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("idToken");
      localStorage.removeItem("token");
      // Redirect or invoke fallback authentication provider placeholder
      console.warn("[API_CLIENT] Token expired or invalid authorization context.");
    }

    // Format a unified client-side API error structure
    const unifiedError = {
      message: error.response?.data?.message || error.response?.data?.detail || error.message || "An unexpected error occurred",
      status: error.response?.status || 500,
      code: error.response?.data?.code || "INTERNAL_ERROR",
      originalError: error,
    };

    return Promise.reject(unifiedError);
  }
);
