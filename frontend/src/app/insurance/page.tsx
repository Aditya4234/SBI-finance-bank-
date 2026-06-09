import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Heart, Car, Plane, Home, CheckCircle, Phone, FileText, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer').then(m => ({ default: m.Footer })));

const plans = [
  {
    icon: Shield,
    name: 'Life Insurance',
    desc: 'Secure your family\'s future with comprehensive life cover starting at just ₹500/month.',
    features: ['Cover up to ₹1 Crore', 'Tax benefits u/s 80C', 'Flexible premium terms', 'Maturity benefits'],
    gradient: 'from-premium-blue to-premium-dark',
  },
  {
    icon: Heart,
    name: 'Health Insurance',
    desc: 'Cashless hospitalization across 10,000+ network hospitals with family floater options.',
    features: ['Cover up to ₹50 Lakhs', 'Cashless hospitalization', 'Pre-existing disease cover', 'Annual health checkup'],
    gradient: 'from-green-600 to-emerald-800',
  },
  {
    icon: Car,
    name: 'Motor Insurance',
    desc: 'Comprehensive car & bike insurance with zero-depreciation add-on.',
    features: ['Third-party liability cover', 'Zero depreciation', '24/7 roadside assistance', 'Cashless repairs'],
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: Plane,
    name: 'Travel Insurance',
    desc: 'Stay protected on international trips with medical & baggage cover.',
    features: ['Medical expense cover', 'Baggage loss cover', 'Trip cancellation', 'Personal accident cover'],
    gradient: 'from-cyan-500 to-blue-700',
  },
  {
    icon: Home,
    name: 'Home Insurance',
    desc: 'Comprehensive protection for your home and its contents against unforeseen events.',
    features: ['Structure cover', 'Contents cover', 'Natural disaster cover', 'Theft & burglary cover'],
    gradient: 'from-violet-500 to-purple-800',
  },
];

export default function InsurancePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-sbi-800 via-sbi-900 to-sbi-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.12),transparent_50%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm text-sbi-200 border border-white/20">
                  <Shield className="mr-2 h-4 w-4" /> SBI General Insurance
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Protect What{' '}
                  <span className="text-sbi-gold-light">Matters Most</span>
                </h1>
                <p className="text-lg text-sbi-200 max-w-xl">
                  From life and health to home and travel, SBI offers a wide range of insurance plans 
                  tailored to every stage of life. Trusted by millions across India.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-sbi-gold text-sbi-900 hover:bg-sbi-gold-light font-semibold">
                    <Link href="#plans">
                      Explore Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Link href="/auth/login">
                      Internet Banking
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block animate-fade-in-delay">
                <div className="relative">
                  <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-sbi-gold/20 blur-3xl" />
                  <Card className="relative bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { label: 'Life Cover', value: '₹1 Cr+', sub: 'Starting @ ₹500/mo' },
                          { label: 'Health Cover', value: '₹50 Lakhs', sub: 'Family floater' },
                          { label: 'Claim Settlement', value: '96.5%', sub: 'Industry leading' },
                          { label: 'Network Hospitals', value: '10,000+', sub: 'Cashless' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg bg-white/5 p-4 border border-white/10">
                            <p className="text-xs text-sbi-300">{item.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                            <p className="text-xs text-sbi-300 mt-0.5">{item.sub}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sbi-600">Our Plans</span>
              <h2 className="text-3xl font-bold text-sbi-900 mt-3">Choose Your Insurance Plan</h2>
              <p className="text-sbi-500 mt-3">Comprehensive coverage for every aspect of your life</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className="group relative rounded-2xl bg-white overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className={`h-36 bg-gradient-to-br ${plan.gradient} p-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
                      <Icon className="h-12 w-12 text-white/30 absolute bottom-4 right-4" />
                      <h3 className="relative text-xl font-bold text-white">{plan.name}</h3>
                      <p className="relative text-sm text-white/70 mt-1">{plan.desc}</p>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-sbi-700">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="mt-6 w-full">
                        <Link href="/auth/register">
                          Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sbi-600">Why SBI Insurance</span>
              <h2 className="text-3xl font-bold text-sbi-900 mt-3">Why Choose SBI Insurance?</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Shield, title: 'Trusted since 1955', desc: 'Backed by the State Bank of India, the country\'s largest and most trusted banking group.' },
                { icon: FileText, title: 'Hassle-free Claims', desc: '96.5% claim settlement ratio with fully digital claim filing and tracking.' },
                { icon: Phone, title: '24/7 Support', desc: 'Round-the-clock customer support via phone, email, and over 50,000 branch offices.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="mx-auto h-14 w-14 rounded-full bg-sbi-50 flex items-center justify-center mb-5">
                      <Icon className="h-7 w-7 text-sbi-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-sbi-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-sbi-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-sbi-800 to-sbi-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Secure Your Future?</h2>
            <p className="text-sbi-200 mt-3 max-w-lg mx-auto">Get a free quote in under 2 minutes. No paperwork required.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button asChild size="lg" className="bg-sbi-gold text-sbi-900 hover:bg-sbi-gold-light font-semibold">
                <Link href="/auth/register">
                  Buy Insurance <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="tel:18001234567">
                  <Phone className="mr-2 h-4 w-4" /> Call 1800-123-4567
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
