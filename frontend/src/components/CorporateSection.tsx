import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2 } from 'lucide-react';

export function CorporateSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-sbi-900">Business Banking Made Simple</h2>
            <p className="mt-4 text-sbi-700">
              From startups to enterprises, our corporate banking solutions are designed to help your business grow. 
              Enjoy seamless transactions, dedicated relationship managers, and customized credit solutions.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/register">
                Corporate Banking <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div>
            <div className="rounded-2xl gradient-primary p-8 text-white">
              <Building2 className="h-10 w-10 mb-4 text-sbi-gold" />
              <h3 className="text-xl font-bold">Corporate Banking</h3>
              <p className="mt-2 text-sbi-300">Tailored solutions for your business</p>
              <div className="mt-6 space-y-3">
                {[
                  'Corporate Current Accounts',
                  'Bulk Payment Processing',
                  'Payroll Management',
                  'Trade Finance & Forex',
                  'GST & Tax Payments',
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
