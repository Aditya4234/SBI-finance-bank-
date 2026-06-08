import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary text-white font-bold text-sm">
          SBI
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-sbi-600 dark:text-sbi-400" />
        <p className="text-sm font-medium text-sbi-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
