import Link from 'next/link';
import { ArrowRight, PiggyBank, Shield, Sparkles, Percent, Phone, Wallet, Zap } from 'lucide-react';

const benefits = [
  { icon: Percent, title: 'High Interest Rates', desc: 'Earn up to 7% p.a. on your savings, the best in the industry.' },
  { icon: Wallet, title: 'Zero Balance Option', desc: 'Open your account with zero minimum balance requirement.' },
  { icon: Shield, title: 'Free Insurance Cover', desc: 'Get free accidental insurance cover up to ₹10 lakhs.' },
  { icon: Zap, title: 'Instant Digital Banking', desc: 'UPI, Net Banking, Mobile Banking — all at your fingertips.' },
];

export default function SavingsAccountPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <PiggyBank className="h-5 w-5" /> Savings Account
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Savings That{' '}
            <span className="text-premium-gold">Grow Faster</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Open a savings account online in minutes and earn up to 7% interest with zero maintenance charges.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Open Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all">
              Internet Banking
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Benefits of Savings Account</h2>
            <p className="text-gray-500 mt-3">Designed to help you save more while enjoying premium banking services</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="group rounded-2xl bg-gray-50 p-6 hover:bg-premium-blue hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-premium-blue/10 text-premium-blue group-hover:bg-white/20 group-hover:text-white transition-all">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mt-4 group-hover:text-white text-premium-dark">{b.title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-white/70 mt-2">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Start Saving Today</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Open your Savings Account digitally with zero paperwork.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Open Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
