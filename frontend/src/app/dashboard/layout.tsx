'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  LayoutDashboard, Wallet, ArrowUpDown, Users, PiggyBank, Building2, Shield,
  Settings, HelpCircle, CreditCard, Bell, ArrowLeftRight, X,
  FileText, Globe, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

function getOverviewHref(role: string) {
  if (role === 'SUPER_ADMIN' || role === 'BANK_ADMIN') return '/dashboard/admin';
  if (['CORPORATE_ADMIN', 'FINANCE_MANAGER', 'EMPLOYEE'].includes(role)) return '/dashboard/corporate';
  return '/dashboard';
}

const sidebarItems = (role: string) => [
  { icon: LayoutDashboard, label: 'Overview', href: getOverviewHref(role) },
  { icon: Wallet, label: 'Accounts', href: '/dashboard/accounts' },
  { icon: ArrowLeftRight, label: 'Transfer', href: '/transfer' },
  { icon: CreditCard, label: 'Cards', href: '/dashboard/cards' },
  { icon: Zap, label: 'Bills & Recharges', href: '/bills' },
  { icon: FileText, label: 'Cheques', href: '/cheques' },
  { icon: Globe, label: 'NRI Accounts', href: '/nri-accounts' },
  { icon: PiggyBank, label: 'Loans', href: '/loans' },
  { icon: Users, label: 'Beneficiaries', href: '/beneficiaries' },
];

const roleSpecificItems: Record<string, { icon: any; label: string; href: string }[]> = {
  SUPER_ADMIN: [
    { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin' },
    { icon: Building2, label: 'Corporate', href: '/dashboard/corporate' },
  ],
  BANK_ADMIN: [
    { icon: Shield, label: 'Admin Panel', href: '/dashboard/admin' },
  ],
  CORPORATE_ADMIN: [
    { icon: Building2, label: 'Corporate', href: '/dashboard/corporate' },
  ],
  FINANCE_MANAGER: [
    { icon: Building2, label: 'Corporate', href: '/dashboard/corporate' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !user) return null;

  const extraItems = roleSpecificItems[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header onSidebarToggle={() => setMobileSidebarOpen(prev => !prev)} />
      <div className="flex overflow-x-hidden">

        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <aside className={cn(
          "flex-col w-64 bg-white border-r border-sbi-100 dark:bg-slate-800 dark:border-slate-700 min-h-[calc(100vh-4rem)] p-4 fixed left-0 top-16 z-40 transition-transform duration-200",
          "-translate-x-full",
          mobileSidebarOpen && "translate-x-0",
          "lg:translate-x-0",
          !sidebarOpen && "lg:-translate-x-full"
        )}>
          <div className="lg:hidden flex justify-end mb-2">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-full p-1 hover:bg-sbi-100 dark:hover:bg-slate-700"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-sbi-600 dark:text-sbi-400" />
            </button>
          </div>
          <nav className="space-y-1 flex-1">
            {[...sidebarItems(user.role), ...extraItems].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sbi-600 hover:bg-sbi-50 hover:text-sbi-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-sbi-100 dark:border-slate-700 pt-4 space-y-1">
            <Link href="/profile" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sbi-600 hover:bg-sbi-50 dark:text-slate-300 dark:hover:bg-slate-700">
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sbi-600 hover:bg-sbi-50 dark:text-slate-300 dark:hover:bg-slate-700">
              <HelpCircle className="h-4 w-4" /> Help
            </Link>
          </div>
        </aside>
        <main className="flex-1 lg:pl-64 min-w-0">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
