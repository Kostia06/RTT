'use client';
import { useSession } from '@/lib/auth/client';

export const useAuth = () => {
  const { data, isPending } = useSession();
  const user = data?.user ?? null;
  const role = (user as { role?: string } | null)?.role;
  return {
    user,
    role,
    isAuthenticated: !!user,
    isLoading: isPending,
    isEmployee: role === 'employee' || role === 'manager' || role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isAdmin: role === 'admin',
  };
};
