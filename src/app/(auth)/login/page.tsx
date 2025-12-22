import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card } from '@/components/ui';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In | Respect the Technique',
  description: 'Sign in to your Respect the Technique account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block touch-manipulation active:opacity-70 transition-opacity">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Respect the Technique
            </h1>
          </Link>
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Enter your credentials to continue.
          </p>
        </div>

        <Card className="mt-6 sm:mt-8">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
