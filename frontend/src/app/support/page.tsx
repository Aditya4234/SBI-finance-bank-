'use client';

import Link from 'next/link';
import { Phone, Mail, MessageCircle, HelpCircle, ChevronRight, MapPin, Clock, Headphones, Shield } from 'lucide-react';

const supportOptions = [
  {
    icon: Phone,
    title: '24/7 Customer Care',
    desc: 'Talk to our support team anytime, any day.',
    action: '1800-123-4567',
    href: 'tel:18001234567',
    badge: 'Toll Free',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Banking',
    desc: 'Chat with us on WhatsApp for quick queries.',
    action: 'Chat Now',
    href: '#',
    badge: 'Instant',
  },
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'Write to us for detailed assistance.',
    action: 'support@sbifinance.com',
    href: 'mailto:support@sbifinance.com',
    badge: 'Response in 24h',
  },
  {
    icon: MapPin,
    title: 'Visit a Branch',
    desc: 'Find the nearest SBI Finance branch.',
    action: 'Locate Branch',
    href: '#',
    badge: '25,000+ Branches',
  },
];

const faqs = [
  { q: 'How do I reset my internet banking password?', a: 'Visit the login page and click on "Forgot Password". Enter your registered mobile number to receive an OTP and reset your password.' },
  { q: 'What documents are needed to open a savings account?', a: 'You need a valid Aadhaar card, PAN card, passport-size photograph, and address proof.' },
  { q: 'How can I check my account balance?', a: 'You can check your balance via SBI Finance mobile app, internet banking, SMS banking, or by calling our customer care.' },
  { q: 'What is the daily transaction limit for UPI?', a: 'The default UPI transaction limit is ₹1 lakh per day. It can be enhanced based on your account type and request.' },
  { q: 'How do I report a lost or stolen debit card?', a: 'Immediately block your card through the mobile app, internet banking, or call our 24/7 customer care to report and request a replacement.' },
];

export default function SupportPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <div className="flex items-center gap-2 text-premium-gold text-sm font-semibold mb-4">
            <Headphones className="h-5 w-5" /> Support
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            We're Here to{' '}
            <span className="text-premium-gold">Help You</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Get the support you need, when you need it. 24/7 customer service at your fingertips.</p>
        </div>
      </section>

      <section className="bg-white -mt-10 relative z-10">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportOptions.map((opt) => (
              <Link
                key={opt.title}
                href={opt.href}
                className="group rounded-2xl bg-white border border-gray-100 p-6 hover:border-premium-blue/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-premium-blue/10 text-premium-blue group-hover:bg-premium-blue group-hover:text-white transition-all">
                    <opt.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-premium-gold bg-premium-gold/10 px-2 py-0.5 rounded-full">{opt.badge}</span>
                </div>
                <h3 className="font-bold text-premium-dark">{opt.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-premium-blue group-hover:gap-2 transition-all">
                  {opt.action} <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-[900px] px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-premium-blue">FAQ</span>
            <h2 className="text-3xl font-bold text-premium-dark mt-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl bg-white border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-sm font-semibold text-premium-dark hover:text-premium-blue transition-colors">
                  {faq.q}
                  <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-premium-blue to-premium-dark py-16">
        <div className="mx-auto max-w-[1400px] px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Still Have Questions?</h2>
          <p className="text-white/70 mt-3 max-w-lg mx-auto">Our support team is available 24/7 to assist you.</p>
          <Link href="tel:18001234567" className="inline-flex items-center gap-2 rounded-xl bg-premium-gold text-premium-dark px-8 py-3.5 font-semibold mt-8 hover:bg-premium-gold/90 hover:scale-105 transition-all shadow-lg shadow-premium-gold/25">
            Call 1800-123-4567 <Phone className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
