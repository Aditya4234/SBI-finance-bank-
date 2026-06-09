import Link from 'next/link';
import { ArrowRight, HandCoins, Check, Percent, Zap, FileText, Clock } from 'lucide-react';

const features = [
  'Interest rates starting from 10.50% p.a.',
  'Loan up to ₹25 Lakhs',
  'Minimal documentation required',
  'Instant approval & disbursal',
  'Flexible repayment tenure up to 5 years',
  'No collateral required',
];

export default function PersonalLoanPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <HandCoins className="h-5 w-5" /> Personal Loan
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Funds When You{' '}
            <span className="text-premium-gold">Need Them Most</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Instant personal loans starting at 10.50% p.a. with zero collateral and minimal paperwork.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all">
              Internet Banking
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Personal Loan</span>
              <h2 className="text-3xl font-bold text-premium-dark mt-3">Why Choose Us</h2>
              <ul className="mt-6 space-y-4">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-blue text-white px-6 py-3 font-semibold mt-8 hover:bg-premium-dark hover:scale-105 transition-all duration-200">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-gray-50 p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-premium-dark">Quick Facts</h3>
              <div className="mt-6 space-y-5">
                {[
                  { label: 'Interest Rate', value: '10.50% - 24% p.a.', icon: Percent },
                  { label: 'Loan Amount', value: '₹50,000 - ₹25 Lakhs', icon: FileText },
                  { label: 'Repayment', value: '12 - 60 Months', icon: Clock },
                  { label: 'Disbursal', value: 'Within 24 Hours', icon: Zap },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium-blue/10 text-premium-blue">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-sm font-bold text-premium-dark">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Need Quick Funds?</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Get your personal loan approved in minutes. No collateral needed.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Apply for Personal Loan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
