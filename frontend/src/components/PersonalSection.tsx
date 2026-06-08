import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, User } from 'lucide-react';

export function PersonalSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-sbi-900">Personal Banking Made Easy</h2>
            <p className="mt-4 text-sbi-700">
              Manage your finances with ease using our comprehensive personal banking solutions.
              From savings accounts to loans, we have everything you need under one roof.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/register">
                Personal Banking <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div>
            <div className="rounded-2xl gradient-primary p-8 text-white">
              <User className="h-10 w-10 mb-4 text-sbi-gold" />
              <h3 className="text-xl font-bold">Personal Banking</h3>
              <p className="mt-2 text-sbi-300">Banking solutions for individuals</p>
              <div className="mt-6 space-y-3">
                {[
                  'Savings & Current Accounts',
                  'Fixed & Recurring Deposits',
                  'Personal & Home Loans',
                  'Credit & Debit Cards',
                  'UPI & Digital Payments',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-sbi-gold" />
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
