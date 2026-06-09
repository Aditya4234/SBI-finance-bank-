import Link from 'next/link';
import { ArrowRight, PiggyBank, Check, Percent, Shield, Zap, Diamond } from 'lucide-react';

const features = [
  'Interest rates starting from 7.50% p.a.',
  'Loan up to ₹50 Lakhs against gold',
  '90% of gold value as loan amount',
  'Instant approval & disbursal',
  'No income proof required',
  'Flexible repayment options',
];

export default function GoldLoanPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Diamond className="h-5 w-5" /> Gold Loan
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Unlock the Value of{' '}
            <span className="text-premium-gold">Your Gold</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Gold loans starting at 7.50% p.a. Get up to 90% of your gold value with instant approval.</p>
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
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Gold Loan</span>
              <h2 className="text-3xl font-bold text-premium-dark mt-3">Features & Benefits</h2>
              <ul className="mt-6 space-y-4">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-blue text-white px-6 py-3 font-semibold mt-8 hover:bg-premium-dark hover:scale-105 transition-all duration-200">
                Calculate Loan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Starting Rate', value: '7.50%', icon: Percent },
                { label: 'Max Loan Amount', value: '₹50 Lakhs', icon: PiggyBank },
                { label: 'Loan to Value', value: 'Up to 90%', icon: Shield },
                { label: 'Disbursal', value: 'Instant', icon: Zap },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-gray-50 p-6 text-center border border-gray-100">
                  <s.icon className="h-6 w-6 text-premium-blue mx-auto" />
                  <p className="text-2xl font-bold text-premium-dark mt-2">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Your Gold, Your Power</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Get instant funds against your gold at the lowest interest rates.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Apply for Gold Loan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
