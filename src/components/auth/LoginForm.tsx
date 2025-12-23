'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push('/account');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="group">
        <label className="block text-xs font-bold text-black/70 mb-3 tracking-[0.1em] uppercase">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-5 py-4 border-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-base bg-white group-hover:border-gray-300"
            {...register('email')}
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
        {errors.email && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="group">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-black/70 tracking-[0.1em] uppercase">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-black transition-colors">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-5 py-4 border-2 border-gray-200 focus:border-black focus:outline-none transition-all duration-300 text-base bg-white group-hover:border-gray-300"
            {...register('password')}
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
        {errors.password && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
      >
        <span className="relative z-10">{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>

      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-white text-gray-500 tracking-[0.15em] uppercase">New Here?</span>
        </div>
      </div>

      <Link
        href="/register"
        className="block w-full px-8 py-4 border-2 border-black text-black text-xs font-bold tracking-[0.2em] uppercase text-center hover:bg-black hover:text-white transition-all duration-300"
      >
        Create Account
      </Link>
    </form>
  );
};
