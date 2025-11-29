// filepath: c:\Users\dell\WebstormProjects\finalisa\Software_Construction-Testing_Restaurant\frontend\app\context\protectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g., ['admin'], ['admin', 'staff'], ['customer']
};

/**
 * ProtectedRoute Component
 *
 * Protects routes from unauthenticated users and unauthorized roles
 *
 * Usage Examples:
 * - <ProtectedRoute>...</ProtectedRoute>
 *   → Any authenticated user can access
 *
 * - <ProtectedRoute allowedRoles={['admin']}>...</ProtectedRoute>
 *   → Only admins can access
 *
 * - <ProtectedRoute allowedRoles={['customer']}>...</ProtectedRoute>
 *   → Only customers can access
 *
 * - <ProtectedRoute allowedRoles={['admin', 'staff']}>...</ProtectedRoute>
 *   → Admins and staff can access
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to load
    if (loading) return;

    // Check 1: Not authenticated → redirect to login
    if (!user) {
      console.log('🔴 Not authenticated, redirecting to login');
      router.replace("/login");
      return;
    }

    // Check 2: Role authorization (if roles specified)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log(`🔴 Unauthorized role: ${user.role}, required: ${allowedRoles.join(', ')}`);
      router.replace("/unauthorized");
      return;
    }

    console.log('✅ User authorized:', user.email, user.role);
  }, [user, loading, allowedRoles, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated yet
  if (!user) {
    return null;
  }

  // Unauthorized role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  // ✅ Authenticated and authorized
  return <>{children}</>;
}

/**
 * Usage Examples in Pages:
 *
 * // 1. Any authenticated user (customer, staff, admin)
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Dashboard content</div>
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // 2. Admin only
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute allowedRoles={['admin']}>
 *       <div>Admin panel - manage all reservations</div>
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // 3. Customer only
 * export default function MyReservationsPage() {
 *   return (
 *     <ProtectedRoute allowedRoles={['customer']}>
 *       <div>My reservations</div>
 *     </ProtectedRoute>
 *   );
 * }
 *
 * // 4. Admin and Staff
 * export default function ManageTablesPage() {
 *   return (
 *     <ProtectedRoute allowedRoles={['admin', 'staff']}>
 *       <div>Table management</div>
 *     </ProtectedRoute>
 *   );
 * }
 */

