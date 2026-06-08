import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Shield } from 'lucide-react';

const ProductsSection = dynamic(() => import('@/components/ProductsSection').then(m => ({ default: m.ProductsSection })));
const DigitalBankingSection = dynamic(() => import('@/components/DigitalBankingSection').then(m => ({ default: m.DigitalBankingSection })));
const PersonalSection = dynamic(() => import('@/components/PersonalSection').then(m => ({ default: m.PersonalSection })));
const CorporateSection = dynamic(() => import('@/components/CorporateSection').then(m => ({ default: m.CorporateSection })));
const Footer = dynamic(() => import('@/components/Footer').then(m => ({ default: m.Footer })));

const stats = [
  { value: '50M+', label: 'Happy Customers' },
  { value: '50,000+', label: 'ATM Network' },
  { value: '100+', label: 'Years of Trust' },
  { value: '99.9%', label: 'Uptime' },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm text-sbi-200 border border-white/20">
                  <Shield className="mr-2 h-4 w-4" /> India's Most Trusted Bank
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Banking That{' '}
                  <span className="text-sbi-gold-light">Cares</span>
                  {' '}For Your Future
                </h1>
                <p className="text-lg text-sbi-200 max-w-xl">
                  Experience the future of digital banking with SBI. From personal accounts to corporate solutions, 
                  we offer comprehensive banking services backed by a century of trust.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="bg-sbi-gold text-sbi-900 hover:bg-sbi-gold-light font-semibold">
                    <Link href="/auth/register">
                      Open Account <ArrowRight className="ml-2 h-4 w-4" />
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
                          { label: 'Savings A/c', value: '4.25%', sub: 'Interest Rate' },
                          { label: 'FD Rates', value: '7.10%', sub: 'Senior Citizens' },
                          { label: 'Personal Loan', value: '9.99%', sub: 'Starting Rate' },
                          { label: 'Home Loan', value: '8.50%', sub: 'Starting Rate' },
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

        {/* Stats Section */}
        <section className="border-b border-sbi-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-sbi-800">{stat.value}</p>
                  <p className="mt-1 text-sm text-sbi-700">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductsSection />
        <DigitalBankingSection />
        <PersonalSection />
        <CorporateSection />
        <Footer />
      </main>
    </>
  );
}
