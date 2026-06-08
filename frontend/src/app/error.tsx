'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-red-600 dark:text-red-400">Oops!</h1>
        <h2 className="mt-4 text-2xl font-semibold text-sbi-900 dark:text-slate-100">Something went wrong</h2>
        <p className="mt-2 text-sbi-600 dark:text-slate-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        {process.env.NODE_ENV === 'development' && error.stack && (
          <pre className="mt-4 max-w-xl overflow-auto rounded-lg bg-slate-100 p-4 text-left text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {error.stack}
          </pre>
        )}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
