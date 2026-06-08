import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-sbi-600 dark:text-sbi-400">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-sbi-900 dark:text-slate-100">Page Not Found</h2>
        <p className="mt-2 text-sbi-600 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
