'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const role = user?.user_metadata?.role;

  return {
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    // isEmployee includes all staff roles (employee, manager, admin)
    isEmployee: role === 'employee' || role === 'manager' || role === 'admin',
    // isManager includes managers and admins
    isManager: role === 'manager' || role === 'admin',
    // isAdmin is admin only
    isAdmin: role === 'admin',
  };
};
