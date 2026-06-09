import Link from 'next/link';
import { ArrowRight, Building2, PiggyBank, Users, Banknote, Shield, Sparkles } from 'lucide-react';

const accountTypes = [
  {
    title: 'Savings Account',
    desc: 'Earn up to 7% p.a. interest with zero maintenance fees. Start your banking journey today.',
    href: '/accounts/savings',
    icon: PiggyBank,
    badge: '4.25% - 7% Interest',
    features: ['Zero balance option', 'Free debit card', 'UPI & Net Banking', 'Mobile banking'],
  },
  {
    title: 'Current Account',
    desc: 'Tailored banking solutions for businesses of all sizes. Manage your working capital efficiently.',
    href: '/accounts/current',
    icon: Building2,
    badge: 'Business Banking',
    features: ['Overdraft facility', 'Multi-user access', 'Bulk payments', 'Business API'],
  },
  {
    title: 'Salary Account',
    desc: 'Exclusive salary accounts with premium benefits, discounts, and lifestyle rewards.',
    href: '/accounts/salary',
    icon: Users,
    badge: 'Zero Balance',
    features: ['Free insurance cover', 'Shopping discounts', 'Travel benefits', 'Premium lounge access'],
  },
  {
    title: 'NRI Account',
    desc: 'Comprehensive banking solutions for Non-Resident Indians. Manage your finances globally.',
    href: '/accounts/nri',
    icon: Banknote,
    badge: 'Global Banking',
    features: ['NRE/NRO accounts', 'Repatriation', 'FCNR deposits', 'Global transfers'],
  },
];

const stats = [
  { value: '50M+', label: 'Happy Customers' },
  { value: '25,000+', label: 'Branches' },
  { value: '10Cr+', label: 'Digital Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function AccountsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 border border-white/10 mb-6">
              <Shield className="h-4 w-4" /> Backed by India's most trusted bank
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Accounts That{' '}
              <span className="text-premium-gold">Work for You</span>
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl leading-relaxed">
              From everyday savings to global NRI accounts, find the perfect banking solution
              tailored to your needs with industry-best interest rates and zero hidden charges.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-premium-gold/25"
              >
                Open Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Internet Banking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-[1400px] px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-premium-dark">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Types */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-[1400px] px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Our Products</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Choose Your Account Type</h2>
            <p className="text-gray-500 mt-3">Comprehensive banking solutions designed for every stage of life</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {accountTypes.map((account, i) => (
              <Link
                key={account.title}
                href={account.href}
                className="group relative rounded-2xl bg-white p-8 border border-gray-100 hover:border-premium-blue/20 hover:shadow-xl hover:shadow-premium-blue/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-premium-blue/10 to-premium-blue/5 text-premium-blue group-hover:from-premium-blue group-hover:to-premium-dark group-hover:text-white transition-all duration-300">
                    <account.icon className="h-7 w-7" />
                  </div>
                  <span className="text-xs font-semibold text-premium-gold bg-premium-gold/10 px-3 py-1 rounded-full">
                    {account.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-premium-dark group-hover:text-premium-blue transition-colors">
                  {account.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{account.desc}</p>
                <ul className="mt-4 space-y-2">
                  {account.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Sparkles className="h-3.5 w-3.5 text-premium-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-premium-blue group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-premium-blue to-premium-dark">
        <div className="mx-auto max-w-[1400px] px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Open an account in 5 minutes with zero paperwork. Completely digital, fully secure.</p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-premium-gold/25"
          >
            Open Your Account Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
