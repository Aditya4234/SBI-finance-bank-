import { Card, CardContent } from '@/components/ui/card';
import { PiggyBank, CreditCard, Landmark, Building2, BadgePercent, TrendingUp } from 'lucide-react';

const products = [
  { icon: PiggyBank, title: 'Savings Account', desc: 'Start your banking journey with our feature-rich savings accounts' },
  { icon: CreditCard, title: 'Credit Cards', desc: 'Premium credit cards with exclusive rewards and benefits' },
  { icon: Landmark, title: 'Fixed Deposits', desc: 'Secure your future with attractive FD interest rates' },
  { icon: Building2, title: 'Home Loans', desc: 'Make your dream home a reality with affordable home loans' },
  { icon: BadgePercent, title: 'Personal Loans', desc: 'Instant personal loans with minimal documentation' },
  { icon: TrendingUp, title: 'Investments', desc: 'Grow your wealth with our investment solutions' },
];

export function ProductsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sbi-900">Banking Products</h2>
          <p className="mt-4 text-sbi-700 max-w-2xl mx-auto">
            Comprehensive banking solutions tailored for every need
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.title} className="card-hover border-sbi-100">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sbi-100 text-sbi-600">
                  <product.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-sbi-900">{product.title}</h3>
                <p className="mt-2 text-sm text-sbi-700">{product.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
