import Link from 'next/link';
import { ArrowRight, Users, Shield, Gift, Plane, Coffee, ShoppingBag } from 'lucide-react';

const perks = [
  { icon: Shield, title: 'Free Insurance', desc: 'Accidental insurance cover up to ₹20 lakhs included.' },
  { icon: Gift, title: 'Shopping Discounts', desc: 'Up to 50% off on top brands across categories.' },
  { icon: Plane, title: 'Travel Benefits', desc: 'Airport lounge access and travel insurance.' },
  { icon: Coffee, title: 'Lifestyle Perks', desc: 'Movie tickets, dining discounts, and more.' },
];

export default function SalaryAccountPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Users className="h-5 w-5" /> Salary Account
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            More Than Just{' '}
            <span className="text-premium-gold">A Salary Account</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Get premium benefits, exclusive discounts, and a host of lifestyle perks with your salary account.</p>
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
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Salary Perks</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Exclusive Benefits for You</h2>
            <p className="text-gray-500 mt-3">Enjoy a world of benefits designed to make your life better</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="group rounded-2xl bg-gray-50 p-6 hover:bg-premium-blue hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-premium-blue/10 text-premium-blue group-hover:bg-white/20 group-hover:text-white transition-all">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mt-4 text-premium-dark group-hover:text-white">{p.title}</h3>
                <p className="text-sm text-gray-500 group-hover:text-white/70 mt-2">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Switch to SBI Finance Today</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Open a salary account and unlock premium benefits instantly.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Open Salary Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
