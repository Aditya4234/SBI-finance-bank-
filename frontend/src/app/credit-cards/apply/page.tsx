'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CreditCard, Check, ChevronRight, Shield, Clock, FileText } from 'lucide-react';

export default function CreditCardApplyPage() {
  const [step, setStep] = useState(1);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-premium-blue via-premium-blue to-premium-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.12),transparent_50%)]" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-24">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Apply for a{' '}
            <span className="text-premium-gold">Credit Card</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl">Get instant approval. Zero paperwork. Completely digital.</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[800px] px-8">
          <div className="flex items-center justify-center gap-0 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step >= s ? 'bg-premium-blue text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`h-1 w-16 sm:w-32 ${step > s ? 'bg-premium-blue' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 p-8 shadow-lg">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-premium-dark">Personal Details</h2>
                <p className="text-sm text-gray-500">Please provide your basic information to get started</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" placeholder="As on PAN Card" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="tel" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" placeholder="+91" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email ID</label>
                    <input type="email" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" placeholder="your@email.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">PAN Card Number</label>
                    <input type="text" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue uppercase" placeholder="ABCDE1234F" />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-premium-dark">Employment & Income</h2>
                <p className="text-sm text-gray-500">Tell us about your employment status and income</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Employment Type</label>
                    <select className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue">
                      <option>Salaried</option>
                      <option>Self-Employed</option>
                      <option>Business Owner</option>
                      <option>Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Annual Income</label>
                    <select className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue">
                      <option>₹3 - 5 Lakhs</option>
                      <option>₹5 - 10 Lakhs</option>
                      <option>₹10 - 25 Lakhs</option>
                      <option>₹25 Lakhs+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" className="mt-1.5 flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-premium-blue/20 focus:border-premium-blue" />
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-premium-dark">Application Submitted!</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">Your application has been received successfully. We will review and get back to you within 48 hours.</p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                  <FileText className="h-5 w-5 text-premium-blue" />
                  Reference ID: <span className="font-bold text-premium-dark">SBI{Date.now().toString().slice(-8)}</span>
                </div>
                <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-premium-blue text-white px-8 py-3 font-semibold hover:bg-premium-dark transition-all">
                  Go to Home <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 && step <= 3 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-sm font-semibold text-gray-500 hover:text-premium-blue transition-colors">
                  ← Back
                </button>
              ) : <div />}
              {step < 3 && (
                <button onClick={() => setStep(s => s + 1)} className="inline-flex items-center gap-2 rounded-xl bg-premium-blue text-white px-8 py-3 text-sm font-semibold hover:bg-premium-dark hover:scale-105 transition-all duration-200 ml-auto">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 256-bit encrypted</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Takes 5 minutes</span>
          </div>
        </div>
      </section>
    </main>
  );
}
