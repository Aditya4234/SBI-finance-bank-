import Link from 'next/link';
import { ArrowRight, CreditCard, Check, Percent, Shield, Zap } from 'lucide-react';

const features = [
  'Interest rates starting from 9.25% p.a.',
  'Loan up to 100% of on-road price',
  'Flexible tenure up to 7 years',
  'Quick approval within 24 hours',
  'Zero foreclosure charges',
  'Balance transfer facility available',
];

export default function CarLoanPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <CreditCard className="h-5 w-5" /> Car Loan
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Drive Your{' '}
            <span className="text-premium-gold">Dream Car</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Car loans starting at 9.25% p.a. with instant approval and zero prepayment charges.</p>
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
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Car Loan</span>
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
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Starting Rate', value: '9.25%', icon: Percent },
                { label: 'Max Tenure', value: '7 Years', icon: Shield },
                { label: 'Processing', value: '24 Hours', icon: Zap },
                { label: 'Coverage', value: '100%', icon: CreditCard },
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
          <h2 className="text-3xl font-bold text-white">Ready to Hit the Road?</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Get your car loan approved in just 24 hours.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Apply for Car Loan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
