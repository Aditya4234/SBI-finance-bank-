import Link from 'next/link';
import { ArrowRight, Banknote, Globe, Shield, ArrowLeftRight, Phone, RefreshCw } from 'lucide-react';

const features = [
  { icon: Banknote, title: 'NRE Account', desc: 'Repatriable account to manage your overseas earnings.' },
  { icon: Globe, title: 'NRO Account', desc: 'Manage local income and investments in India.' },
  { icon: Shield, title: 'FCNR Deposits', desc: 'Fixed deposits in foreign currency with high returns.' },
  { icon: ArrowLeftRight, title: 'Global Transfers', desc: 'Seamless money transfers across borders.' },
];

export default function NRIPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Globe className="h-5 w-5" /> NRI Banking
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Global Banking,{' '}
            <span className="text-premium-gold">Indian Heart</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Comprehensive banking solutions for Non-Resident Indians across the globe.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Open NRI Account <ArrowRight className="h-4 w-4" />
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
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">NRI Services</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Banking Without Borders</h2>
            <p className="text-gray-500 mt-3">Manage your finances in India from anywhere in the world</p>
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
          <h2 className="text-3xl font-bold text-white">Wherever You Are, We're Here</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Open an NRI account from anywhere in the world. Completely digital.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Open NRI Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
