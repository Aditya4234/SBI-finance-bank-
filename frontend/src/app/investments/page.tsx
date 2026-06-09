import Link from 'next/link';
import { ArrowRight, TrendingUp, BarChart3, PiggyBank, Shield, LineChart, Coins, ArrowUpRight } from 'lucide-react';

const products = [
  { icon: BarChart3, title: 'Fixed Deposits', desc: 'Lock in high returns with flexible tenures.', rate: 'Up to 8.50%', href: '#' },
  { icon: TrendingUp, title: 'Mutual Funds', desc: 'Diversified investment options for every goal.', rate: 'Top-rated funds', href: '#' },
  { icon: LineChart, title: 'Stocks & IPO', desc: 'Trade in stock markets. Apply for IPOs.', rate: 'Zero brokerage', href: '#' },
  { icon: Coins, title: 'Digital Gold', desc: 'Invest in 24K gold digitally, starting ₹1.', rate: 'Secure storage', href: '#' },
  { icon: PiggyBank, title: 'Recurring Deposits', desc: 'Build savings habit with small monthly investments.', rate: 'Up to 7.25%', href: '#' },
  { icon: Shield, title: 'Government Bonds', desc: 'Risk-free sovereign guaranteed returns.', rate: 'Tax-saver options', href: '#' },
];

export default function InvestmentsPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <TrendingUp className="h-5 w-5" /> Investments
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Grow Your{' '}
            <span className="text-premium-gold">Wealth</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Smart investment solutions tailored to your financial goals. Start with as little as ₹100.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Start Investing <ArrowRight className="h-4 w-4" />
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
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Investment Options</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Choose Your Investment</h2>
            <p className="text-gray-500 mt-3">From safe deposits to high-growth investments, we have it all</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.title} className="group rounded-2xl border border-gray-100 p-6 hover:border-premium-blue/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-premium-blue/10 text-premium-blue group-hover:bg-premium-blue group-hover:text-white transition-all">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{p.rate}</span>
                </div>
                <h3 className="text-lg font-bold text-premium-dark mt-4">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                <Link href={p.href} className="mt-4 flex items-center gap-1 text-sm font-semibold text-premium-blue group-hover:gap-2 transition-all">
                  Learn More <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Start Your Investment Journey</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Begin with as little as ₹100. No hidden charges, complete transparency.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Start Investing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
