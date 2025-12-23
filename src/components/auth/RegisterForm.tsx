'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');

      // Register with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Auto-login after successful registration
      if (authData.user) {
        router.push('/account');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-black mb-2 tracking-tight">
          Full Name
        </label>
        <input
          type="text"
          placeholder="John Doe"
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-base"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2 tracking-tight">
          Email Address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-base"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2 tracking-tight">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-base"
          {...register('password')}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-black mb-2 tracking-tight">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors text-base"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-black hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
