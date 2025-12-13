"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance, { registerUnauthenticatedHandler } from "@/app/utils/ApiClient";
import { usePathname, useRouter } from "next/navigation";

// ✅ FIXED: Removed age field, matches backend user schema
type User = {
  id: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // ✅ FIXED: Use /users/profile instead of /auth/me (which doesn't exist)
  const fetchMe = async () => {
    try {
      const res = await axiosInstance.get<User>("/users/profile");
      setUser({
        id: res.data.id,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
        phone: res.data.phone,
      });
      console.log('✅ User fetched:', res.data);
    } catch (error) {
      console.log('❌ Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check on mount
  useEffect(() => {
    fetchMe();
  }, []);

  // Register unauthorized handler
  useEffect(() => {
    const handleUnauthenticated = () => {
      console.log('🔴 Unauthorized - redirecting to login');
      setUser(null);
      router.replace("/login");
    };
    registerUnauthenticatedHandler(handleUnauthenticated);
  }, [router]);

  // Revalidate auth on route change (only if user exists)
  useEffect(() => {
    if (!pathname || pathname === '/login' || pathname === '/register') return;

    // Only revalidate if user exists (prevent unnecessary calls)
    if (user) {
      console.log("Route changed, revalidating auth:", pathname);
      axiosInstance
        .get("/users/profile")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          setUser(null);
          router.replace("/login");
        });
    }
  }, [pathname, user, router]);

  // Login: backend sets cookie, then fetch user
  const login = async (email: string, password: string) => {
    const url = axiosInstance.getUri() + "/auth/login";
    console.log("Attempting to log in to:", url);
    await axiosInstance.post("/auth/login", { email, password });
    await fetchMe(); // Fetch user data after successful login
  };

  // Logout: backend clears cookie
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.log('Logout error:', error);
    }
    setUser(null);
    router.replace("/login");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}