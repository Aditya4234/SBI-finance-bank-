'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CreditCard, Shield, Gift, Plane, Users, Check, Sparkles, ChevronRight } from 'lucide-react';

const cards = [
  {
    name: 'Platinum Card',
    desc: 'Premium lifestyle & travel rewards for the discerning spender.',
    href: '/credit-cards',
    badge: 'Premium',
    features: ['Airport lounge access', '5x reward points on travel', 'Zero foreign markup', 'Concierge service'],
    gradient: 'from-gray-900 via-slate-800 to-gray-900',
  },
  {
    name: 'Gold Card',
    desc: 'Everyday rewards, cashback, and dining privileges.',
    href: '/credit-cards',
    badge: 'Lifestyle',
    features: ['1% unlimited cashback', 'Dining discounts up to 25%', 'Fuel surcharge waiver', 'Movie ticket offers'],
    gradient: 'from-premium-gold via-yellow-600 to-premium-gold',
  },
  {
    name: 'Corporate Card',
    desc: 'Expense management solutions for your business.',
    href: '/credit-cards',
    badge: 'Business',
    features: ['Expense tracking dashboard', 'Custom spending limits', 'GST input credit', 'Vendor payments'],
    gradient: 'from-premium-blue via-blue-700 to-premium-dark',
  },
];

export default function CreditCardsPage() {
  const [selectedCard, setSelectedCard] = useState(0);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <CreditCard className="h-5 w-5" /> Credit Cards
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Rewards That{' '}
            <span className="text-premium-gold">Elevate You</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Choose from a range of premium credit cards designed for every lifestyle and need.</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/credit-cards/apply" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-6 py-3 font-semibold hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 font-semibold hover:bg-white/10 transition-all">
              Internet Banking
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">Our Range</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Choose Your Card</h2>
            <p className="text-gray-500 mt-3">Each card comes with a unique set of benefits tailored for you</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {cards.map((card, i) => (
              <div
                key={card.name}
                className="group relative rounded-2xl bg-white overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setSelectedCard(i)}
              >
                <div className={`h-40 bg-gradient-to-br ${card.gradient} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
                  <CreditCard className="h-16 w-16 text-white/30 absolute bottom-4 right-4" />
                  <span className="relative inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> {card.badge}
                  </span>
                  <h3 className="relative text-2xl font-bold text-white mt-3">{card.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                  <ul className="mt-4 space-y-2.5">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/credit-cards/apply"
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-premium-blue text-white py-3 text-sm font-semibold hover:bg-premium-dark hover:scale-[1.02] transition-all duration-200 active:scale-95"
                  >
                    Apply Now <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready for a Premium Card?</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Apply in minutes and get instant approval decision.</p>
          <Link href="/credit-cards/apply" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Apply for Credit Card <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
