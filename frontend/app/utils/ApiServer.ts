// utils/axiosInstance.ts
import axios from 'axios';
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
export default async function apiserver() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000", // Use environment variable for base URL
    headers: token
      ? { Authorization: `Bearer ${token}` } // send JWT to Nest
      : {},

  });
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      console.log('error status', status);
      if (status === 403 && !window.location.href.includes('/login')
        && !window.location.href.includes('/register')) {
        redirect('/unauthorized')
      }


      return Promise.reject(error);
    }
  );
  return axiosInstance;
}