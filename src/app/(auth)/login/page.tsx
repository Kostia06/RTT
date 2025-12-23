import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | Respect the Technique',
  description: 'Sign in to your Respect the Technique account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-black text-white pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-8 text-white/60 hover:text-white transition-colors text-xs tracking-[0.15em] uppercase">
            ← Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.02em] mb-3">
            Welcome Back
          </h1>
          <p className="text-sm text-white/60">
            Sign in to access your account and continue your ramen journey.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
