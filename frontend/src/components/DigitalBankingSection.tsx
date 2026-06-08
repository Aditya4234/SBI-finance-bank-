import { Smartphone, Zap, Globe, Clock, Shield } from 'lucide-react';

export function DigitalBankingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center rounded-full bg-sbi-100 px-4 py-1.5 text-sm text-sbi-700 mb-6">
              <Smartphone className="mr-2 h-4 w-4" /> Digital Banking
            </div>
            <h2 className="text-3xl font-bold text-sbi-900">Bank Anywhere, Anytime</h2>
            <p className="mt-4 text-sbi-700">
              Access your accounts 24/7 with our secure digital banking platform. 
              Transfer funds, pay bills, manage investments, and more from the comfort of your home.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Zap, title: 'Instant Transfer', desc: 'NEFT/RTGS/IMPS 24x7' },
                { icon: Globe, title: 'Global Access', desc: 'Bank from anywhere' },
                { icon: Clock, title: 'Quick Service', desc: 'Most requests in minutes' },
                { icon: Shield, title: 'Bank Grade Security', desc: '256-bit encryption' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sbi-100 text-sbi-600">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sbi-900 text-sm">{f.title}</p>
                    <p className="text-xs text-sbi-700">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-sbi-800 p-8 text-white">
              <h3 className="text-xl font-bold">SBI YONO</h3>
              <p className="mt-2 text-sbi-300">One app. All banking.</p>
              <div className="mt-6 space-y-4">
                {[
                  'Fund Transfer & UPI Payments',
                  'Credit Card Management',
                  'Loan Application & Tracking',
                  'Investment & Insurance',
                  'Bill Payments & Recharges',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-sbi-gold" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
