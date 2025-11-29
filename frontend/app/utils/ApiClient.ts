// utils/axiosInstance.ts
"use client";
import axios from 'axios';
import { redirect } from 'next/navigation';

// ✅ FIXED: Backend runs on port 8000, not 3000
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true, // ✅ Required for cookies (JWT token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// This variable will hold the function that AuthContext gives us
let onUnAuthenticated: (() => void) | undefined;

// AuthContext will call this later
export function registerUnauthenticatedHandler(handler: () => void) {
  onUnAuthenticated = handler;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    console.log('API Error Status:', status);

    // Handle 403 Forbidden
    if (status === 403 &&
        !window.location.href.includes('/login') &&
        !window.location.href.includes('/register')) {
      redirect('/unauthorized');
    }

    // Handle 401 Unauthorized
    if (status === 401 &&
        !window.location.href.includes('/login') &&
        !window.location.href.includes('/register')) {
      if (onUnAuthenticated) {
        onUnAuthenticated();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;