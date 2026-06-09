import Link from 'next/link';
import { ArrowRight, Home, Shield, Percent, Check, Building2, Sparkles } from 'lucide-react';

const features = [
  'Interest rates starting from 8.50% p.a.',
  'Loan up to ₹5 Crores',
  'Flexible tenure up to 30 years',
  'Zero processing fees on select schemes',
  'Quick approval within 48 hours',
  'Balance transfer facility available',
];

export default function HomeLoanPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Home className="h-5 w-5" /> Home Loan
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Make Your Dream{' '}
            <span className="text-premium-gold">Home a Reality</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Affordable home loans starting at 8.50% p.a. with quick approval and zero hidden charges.</p>
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
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Why Choose Us</span>
              <h2 className="text-3xl font-bold text-premium-dark mt-3">Home Loan Features</h2>
              <ul className="mt-6 space-y-4">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-blue text-white px-6 py-3 font-semibold mt-8 hover:bg-premium-dark hover:scale-105 transition-all duration-200">
                Check Eligibility <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-gray-50 p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-premium-dark">EMI Calculator</h3>
              <p className="text-sm text-gray-500 mt-2">Estimate your monthly payments</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                  <input type="range" className="w-full mt-2 accent-premium-blue" defaultValue={5000000} min={100000} max={50000000} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹1 Lac</span>
                    <span className="font-semibold text-premium-blue">₹50 Lacs</span>
                    <span>₹5 Cr</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tenure (Years)</label>
                  <input type="range" className="w-full mt-2 accent-premium-blue" defaultValue={20} min={1} max={30} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 Year</span>
                    <span className="font-semibold text-premium-blue">20 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly EMI</span>
                    <span className="text-2xl font-bold text-premium-blue">₹43,391</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Your Dream Home Awaits</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Apply for a home loan today and get approval within 48 hours.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Apply for Home Loan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
