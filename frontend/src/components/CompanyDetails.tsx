import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, FileText, Shield, CheckCircle, XCircle, Wallet, Users, ArrowUpRight, Plus, Send, CreditCard, TrendingUp, Globe } from 'lucide-react';

const features = [
  { icon: Plus, label: 'Add Employee', href: '/dashboard/corporate' },
  { icon: Send, label: 'Bulk Payment', href: '/dashboard/corporate' },
  { icon: ArrowUpRight, label: 'Fund Transfer', href: '/transfer' },
  { icon: Wallet, label: 'Account Opening', href: '/dashboard/accounts' },
  { icon: FileText, label: 'Transaction History', href: '/dashboard/corporate' },
  { icon: Users, label: 'Employee Management', href: '/dashboard/corporate' },
  { icon: CreditCard, label: 'Business Cards', href: '/dashboard/cards' },
  { icon: TrendingUp, label: 'Business Loans', href: '/loans' },
  { icon: Globe, label: 'Trade Finance', href: '/nri-accounts' },
];

export function CompanyDetails({ company, accounts = [] }: { company: any; accounts?: any[] }) {
  const accountTypes = [...new Set(accounts.map((a: any) => a.accountType))];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sbi-600" /> Company Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> Company Name</p>
              <p className="font-medium text-sm">{company?.companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><FileText className="h-3 w-3" /> CIN Number</p>
              <p className="font-medium text-sm">{company?.cinNumber || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><FileText className="h-3 w-3" /> GST Number</p>
              <p className="font-medium text-sm">{company?.gstNumber || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><FileText className="h-3 w-3" /> PAN Number</p>
              <p className="font-medium text-sm">{company?.panNumber || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Shield className="h-3 w-3" /> Business Type</p>
              <p className="font-medium text-sm capitalize">{company?.businessType || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-sbi-500 flex items-center gap-1"><Shield className="h-3 w-3" /> KYC Status</p>
              <Badge variant={company?.isVerified ? 'success' : 'warning'} className="mt-0.5">
                {company?.isVerified ? 'Verified' : company?.kycStatus || 'Pending'}
              </Badge>
            </div>
            {company?.registeredAddress && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-sbi-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> Registered Address</p>
                <p className="font-medium text-sm">
                  {company.registeredAddress.street}, {company.registeredAddress.city}, {company.registeredAddress.state} — {company.registeredAddress.pincode}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sbi-600" /> Account Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Current Account', 'Savings Account', 'Fixed Deposit'].map((type) => {
            const key = type === 'Fixed Deposit' ? 'fixed_deposit' : type.toLowerCase().replace(' account', '');
            const isActive = accountTypes.includes(key);
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${isActive ? 'bg-sbi-100 text-sbi-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Wallet className="h-4 w-4" />
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
            <Users className="h-5 w-5 text-sbi-600" /> Corporate Banking Features
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
