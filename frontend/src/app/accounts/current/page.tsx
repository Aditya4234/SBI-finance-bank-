import Link from 'next/link';
import { ArrowRight, Building2, Shield, TrendingUp, Users, Globe, Zap } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Overdraft Facility', desc: 'Get up to ₹50 lakhs overdraft to manage your working capital.' },
  { icon: Users, title: 'Multi-User Access', desc: 'Add multiple users with role-based access control for your team.' },
  { icon: Globe, title: 'Business API', desc: 'Integrate our banking APIs for seamless business operations.' },
  { icon: Zap, title: 'Bulk Payments', desc: 'Process salary, vendor, and bulk payments in one click.' },
];

export default function CurrentAccountPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Building2 className="h-5 w-5" /> Current Account
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Banking That{' '}
            <span className="text-premium-gold">Means Business</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Powerful banking solutions designed for businesses, startups, and enterprises.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Open Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all">
              Corporate Login
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Business Banking</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Features Designed for Growth</h2>
            <p className="text-gray-500 mt-3">Everything your business needs to manage finances efficiently</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 p-8 hover:border-premium-blue/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-premium-blue/10 text-premium-blue group-hover:bg-premium-blue group-hover:text-white transition-all">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-premium-dark mt-5">{f.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Empower Your Business</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Open a current account today and unlock premium business banking.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
