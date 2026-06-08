import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Mail, Phone, Fingerprint, CreditCard, MapPin, Calendar, Shield, CheckCircle, XCircle, Landmark, PiggyBank, Wallet, Building2, ArrowUpRight, Plus, ArrowLeftRight, Zap, FileText, TrendingUp } from 'lucide-react';

const accountTypeIcons: Record<string, any> = {
  savings: Wallet,
  current: Building2,
  salary: Landmark,
  fixed_deposit: PiggyBank,
  recurring_deposit: TrendingUp,
};

const features = [
  { icon: Plus, label: 'Open Account', href: '/dashboard/accounts' },
  { icon: ArrowLeftRight, label: 'Fund Transfer', href: '/transfer' },
  { icon: Zap, label: 'UPI', href: '/transfer' },
  { icon: ArrowUpRight, label: 'NEFT/RTGS/IMPS', href: '/transfer' },
  { icon: FileText, label: 'Mini Statement', href: '/dashboard' },
  { icon: FileText, label: 'Transaction History', href: '/transfer' },
  { icon: CreditCard, label: 'Card Management', href: '/dashboard/cards' },
  { icon: PiggyBank, label: 'Loan Application', href: '/loans' },
  { icon: TrendingUp, label: 'EMI Calculator', href: '/loans' },
  { icon: User, label: 'Profile Management', href: '/profile' },
];

export function CustomerDetails({ user, accounts = [] }: { user: any; accounts?: any[] }) {
  const accountTypes = [...new Set(accounts.map((a: any) => a.accountType))];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-sbi-600" /> Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><User className="h-3 w-3" /> Full Name</p>
              <p className="font-medium text-sm">{user.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Phone className="h-3 w-3" /> Mobile Number</p>
              <p className="font-medium text-sm">{user.mobile}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
              <p className="font-medium text-sm">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Fingerprint className="h-3 w-3" /> PAN</p>
              <p className="font-medium text-sm">{user.pan || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><CreditCard className="h-3 w-3" /> Aadhaar</p>
              <p className="font-medium text-sm">{user.aadhaar || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</p>
              <p className="font-medium text-sm">{user.address || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> DOB</p>
              <p className="font-medium text-sm">{user.dob || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Shield className="h-3 w-3" /> KYC Status</p>
              <Badge variant={user.isKycCompleted ? 'success' : 'warning'} className="mt-0.5">
                {user.isKycCompleted ? 'Completed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-sbi-600" /> Account Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Savings Account', 'Current Account', 'Salary Account', 'Fixed Deposit', 'Recurring Deposit'].map((type) => {
            const key = type === 'Fixed Deposit' ? 'fixed_deposit' : type === 'Recurring Deposit' ? 'recurring_deposit' : type.toLowerCase().replace(' account', '');
            const Icon = accountTypeIcons[key] || Wallet;
            const isActive = accountTypes.includes(key);
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${isActive ? 'bg-sbi-100 text-sbi-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? 'text-sbi-900' : 'text-gray-400'}`}>{type}</p>
                </div>
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
              </div>
            );
          })}
          <Button variant="outline" size="sm" className="w-full mt-2" asChild>
            <Link href="/dashboard/accounts"><Plus className="h-4 w-4 mr-2" /> Open New Account</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-sbi-600" /> Banking Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {features.map((f) => (
              <Button key={f.label} asChild variant="outline" className="h-auto py-3 flex-col gap-1.5">
                <Link href={f.href}>
                  <f.icon className="h-5 w-5 text-sbi-600" />
                  <span className="text-xs font-medium">{f.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
