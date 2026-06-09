'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { accountApi, transactionApi, loanApi } from '@/services/api';
import { formatCurrency, maskCardNumber, cn } from '@/lib/utils';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, PiggyBank, TrendingUp, Landmark, Building2,
  Shield, Eye, EyeOff, Zap, FileText, Download, CircleDollarSign,
  Smartphone, ChevronRight, Clock, CheckCircle, AlertTriangle, Briefcase,
  CreditCard, Sparkles, Lock, Fingerprint, Send, TrendingDown, MoreHorizontal,
  ArrowUpDown, RefreshCw, QrCode, ScanLine, Users, Gift, MapPin,
  Menu, Plus, Bell, User, DollarSign, Percent, Target, Activity,
  Award, Coins, Star, ShoppingBag, Home, Phone, Sun, Wifi,
} from 'lucide-react';

const InvestmentChart = dynamic(() => import('./_charts/InvestmentChart'), { ssr: false });
const GrowthChart = dynamic(() => import('./_charts/GrowthChart'), { ssr: false });
const SpendingChart = dynamic(() => import('./_charts/SpendingChart'), { ssr: false });

const monthlyData = [
  { month: 'Jan', spending: 42000, income: 85000, savings: 43000 },
  { month: 'Feb', spending: 38000, income: 85000, savings: 47000 },
  { month: 'Mar', spending: 45000, income: 85000, savings: 40000 },
  { month: 'Apr', spending: 35000, income: 85000, savings: 50000 },
  { month: 'May', spending: 52000, income: 95000, savings: 43000 },
  { month: 'Jun', spending: 40000, income: 95000, savings: 55000 },
  { month: 'Jul', spending: 48000, income: 95000, savings: 47000 },
];

const investmentData = [
  { name: 'Mutual Funds', value: 350000, color: '#3B82F6' },
  { name: 'SIP', value: 120000, color: '#8B5CF6' },
  { name: 'Gold', value: 80000, color: '#F59E0B' },
  { name: 'Bonds', value: 50000, color: '#10B981' },
  { name: 'Stocks', value: 95000, color: '#EC4899' },
];

const portfolioGrowth = [
  { month: 'Jan', value: 580000 }, { month: 'Feb', value: 595000 },
  { month: 'Mar', value: 585000 }, { month: 'Apr', value: 615000 },
  { month: 'May', value: 640000 }, { month: 'Jun', value: 660000 },
  { month: 'Jul', value: 695000 },
];

const transactions = [
  { id: 1, date: '07 Jun', desc: 'Salary Credit - SBI', type: 'credit', amount: 95000, status: 'success', account: 'Savings A/C', category: 'salary' },
  { id: 2, date: '07 Jun', desc: 'UPI Payment to Rahul', type: 'debit', amount: 2500, status: 'success', account: 'Savings A/C', category: 'transfer' },
  { id: 3, date: '06 Jun', desc: 'Electricity Bill Payment', type: 'debit', amount: 1840, status: 'success', account: 'Current A/C', category: 'bills' },
  { id: 4, date: '05 Jun', desc: 'SIP Investment - ELSS', type: 'debit', amount: 5000, status: 'success', account: 'Savings A/C', category: 'investment' },
  { id: 5, date: '04 Jun', desc: 'Amazon Pay Credit Card', type: 'debit', amount: 12450, status: 'pending', account: 'Credit Card', category: 'shopping' },
  { id: 6, date: '03 Jun', desc: 'Freelance Payment', type: 'credit', amount: 25000, status: 'success', account: 'Current A/C', category: 'income' },
  { id: 7, date: '02 Jun', desc: 'Swiggy Order', type: 'debit', amount: 456, status: 'success', account: 'Savings A/C', category: 'food' },
  { id: 8, date: '01 Jun', desc: 'Mobile Recharge', type: 'debit', amount: 499, status: 'success', account: 'Savings A/C', category: 'bills' },
];

const loans = [
  { id: 1, type: 'Home Loan', amount: 3500000, remaining: 2850000, emi: 28450, progress: 65, due: '12 Jun', icon: Home },
  { id: 2, type: 'Car Loan', amount: 800000, remaining: 420000, emi: 12500, progress: 48, due: '18 Jun', icon: Briefcase },
  { id: 3, type: 'Personal Loan', amount: 200000, remaining: 85000, emi: 7200, progress: 78, due: '25 Jun', icon: Wallet },
];

const alerts = [
  { id: 1, type: 'fraud', title: 'Suspicious Login Attempt', desc: 'Failed login from Mumbai, India', time: '5 min ago', severity: 'high' },
  { id: 2, type: 'fraud', title: 'Large Transaction Alert', desc: '₹1,50,000 debit from Current A/C', time: '1 hr ago', severity: 'medium' },
  { id: 3, type: 'fraud', title: 'New Device detected', desc: 'iPhone 15 Pro - Maharashtra', time: '3 hrs ago', severity: 'low' },
];

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg shadow-sbi-900/5',
      'dark:bg-white/5 dark:border-white/10 dark:shadow-black/10',
      className
    )}>
      {children}
    </div>
  );
}

function GradientCircle({ className }: { className?: string }) {
  return <div className={cn('absolute rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-2xl', className)} />;
}

function TransactionIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    salary: <ArrowDownLeft className="h-4 w-4" />,
    transfer: <ArrowUpRight className="h-4 w-4" />,
    bills: <Zap className="h-4 w-4" />,
    investment: <TrendingUp className="h-4 w-4" />,
    shopping: <ShoppingBag className="h-4 w-4" />,
    income: <CircleDollarSign className="h-4 w-4" />,
    food: <Sun className="h-4 w-4" />,
  };
  return <>{icons[category] || <ArrowUpRight className="h-4 w-4" />}</>;
}

function TransactionColor({ type }: { type: string }) {
  return type === 'credit'
    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-sbi-100 dark:bg-sbi-800 rounded-2xl', className)} />;
}

function StatBadge({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
      {Icon && <Icon className={cn('h-4 w-4', color || 'text-white/80')} />}
      <div>
        <p className="text-[9px] text-white/60 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function QRCodePlaceholder() {
  const rows = 9;
  const pattern = [
    [1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1,0,1],
    [0,1,1,1,0,1,0,0,0],
    [1,0,1,0,0,1,1,1,0],
  ];
  return (
    <div className="grid grid-cols-9 gap-[1.5px] w-[108px] h-[108px]">
      {pattern.flat().map((v, i) => (
        <div key={i} className={cn('rounded-[1px]', v ? 'bg-white' : 'bg-white/20')} />
      ))}
    </div>
  );
}

// ────────────── HERO SECTION ──────────────

function HeroSection({ accounts, totalBalance }: { accounts: any[]; totalBalance: number }) {
  const { user } = useAppSelector((s) => s.auth);
  const [showBal, setShowBal] = useState(true);
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [lastLogin, setLastLogin] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    const fn = () => setTime(new Date().toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    fn();
    const i = setInterval(fn, 60000);
    setLastLogin('Today, 08:32 AM');
    return () => clearInterval(i);
  }, []);

  const savings = accounts.find((a: any) => a.accountType === 'savings');
  const current = accounts.find((a: any) => a.accountType === 'current');
  const fd = accounts.find((a: any) => a.accountType === 'fixed_deposit');
  const f = (v: number) => showBal ? formatCurrency(v) : '••••••';

  const quickActions = [
    { icon: ArrowUpRight, label: 'Transfer Money', href: '/transfer', color: 'from-blue-500 to-blue-600' },
    { icon: Zap, label: 'UPI Payment', href: '/bills', color: 'from-purple-500 to-purple-600' },
    { icon: FileText, label: 'Pay Bills', href: '/bills', color: 'from-amber-500 to-amber-600' },
    { icon: Users, label: 'Add Beneficiary', href: '/beneficiaries', color: 'from-emerald-500 to-emerald-600' },
    { icon: CircleDollarSign, label: 'Open FD', href: '/dashboard/accounts', color: 'from-cyan-500 to-cyan-600' },
    { icon: Download, label: 'Download Statement', href: '/dashboard/accounts', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005BAC] via-[#003d7a] to-[#002147] p-5 sm:p-8 lg:p-10 shadow-2xl shadow-sbi-900/30">
      <GradientCircle className="-top-20 -right-20 w-64 h-64" />
      <GradientCircle className="-bottom-32 -left-16 w-80 h-80 bg-white/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

      <div className="relative z-10">
        {/* Top bar: greeting + secure badge */}
        <div className="flex items-start justify-between mb-6 sm:mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{greeting === 'Good Morning' ? '🌅' : greeting === 'Good Afternoon' ? '☀️' : '🌙'}</span>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">{user?.fullName || 'Aditya'}</span>
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">{time}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <Lock className="h-3 w-3 text-emerald-300" />
              <span className="text-[10px] font-medium text-emerald-200">Secure Banking</span>
            </div>
            <button onClick={() => setShowBal(!showBal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all text-[10px] sm:text-xs">
              {showBal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{showBal ? 'Hide' : 'Show'}</span>
            </button>
            <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-sbi-900 border-0 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" /> Premium
            </Badge>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="col-span-2 lg:col-span-4">
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Total Balance</p>
              <div className="flex items-center gap-1 text-[9px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>+12.5%</span>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">{f(totalBalance)}</p>
          </div>
          <StatBadge label="Savings" value={f(savings?.balance || 0)} icon={Building2} />
          <StatBadge label="Current" value={f(current?.balance || 0)} icon={Briefcase} />
          <StatBadge label="Fixed Deposit" value={f(fd?.balance || 0)} icon={CircleDollarSign} />
          <StatBadge label="Last Login" value={lastLogin} icon={Clock} color="text-amber-300" />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}
              className="group relative inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
              <div className={cn('rounded-lg p-1 sm:p-1.5 text-white bg-gradient-to-br shadow-sm', a.color)}>
                <a.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────── ACCOUNT OVERVIEW ──────────────

function AccountOverview({ accounts }: { accounts: any[] }) {
  const [show, setShow] = useState(true);
  const savings = accounts.find((a: any) => a.accountType === 'savings');
  const current = accounts.find((a: any) => a.accountType === 'current');
  const fd = accounts.find((a: any) => a.accountType === 'fixed_deposit');
  const f = (v: number) => show ? formatCurrency(v) : '••••••';
  const trend = (up: boolean, val: string) => (
    <div className={cn('flex items-center gap-0.5 text-[10px] font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{val}
    </div>
  );

  const cards = [
    {
      title: 'Savings Account', balance: savings?.balance || 0, accNum: savings?.accountNumber || '',
      icon: Building2, gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      ring: 'ring-blue-200 dark:ring-blue-700', actions: ['Transfer', 'Statement'],
      trend: trend(true, '+₹3,200 this month'), bgIcon: 'text-blue-200 dark:text-blue-800',
    },
    {
      title: 'Current Account', balance: current?.balance || 0, accNum: current?.accountNumber || '',
      icon: Briefcase, gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      ring: 'ring-emerald-200 dark:ring-emerald-700', actions: ['Transfer', 'Statement'],
      trend: trend(true, '+₹1,500 this month'), bgIcon: 'text-emerald-200 dark:text-emerald-800',
    },
    {
      title: 'Fixed Deposit', balance: fd?.balance || 0, accNum: fd?.accountNumber || '',
      icon: CircleDollarSign, gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      ring: 'ring-amber-200 dark:ring-amber-700', actions: ['Renew', 'Break FD'],
      trend: trend(true, '5.5% p.a. - ₹2,290 interest'), bgIcon: 'text-amber-200 dark:text-amber-800',
      badge: 'Active',
    },
    {
      title: 'Loan Summary', balance: loans.reduce((s, l) => s + l.remaining, 0), icon: Landmark,
      accNum: 'Loan-A/C-XXXX',
      gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      ring: 'ring-purple-200 dark:ring-purple-700', actions: ['Pay EMI', 'Apply'],
      trend: trend(false, '₹2,92,000 unpaid across 3 loans'), bgIcon: 'text-purple-200 dark:text-purple-800',
      badge: '3 Active', subtitle: `${formatCurrency(loans.reduce((s, l) => s + l.emi, 0))}/mo total EMI`,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-sbi-900 dark:text-white">Account Overview</h2>
          <p className="text-xs sm:text-sm text-sbi-400 dark:text-sbi-500">Manage your accounts at a glance</p>
        </div>
        <button onClick={() => setShow(!show)}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-sbi-400 hover:text-sbi-600 dark:hover:text-sbi-300 transition-colors">
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div key={card.title} className={cn('group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br border border-white/50 dark:border-white/5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5', card.gradient)}>
            <div className={cn('absolute -bottom-6 -right-6 opacity-20 dark:opacity-10', card.bgIcon)}>
              <card.icon className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn('rounded-xl p-2.5 bg-white dark:bg-sbi-800 shadow-sm ring-1 ring-sbi-200/50 dark:ring-sbi-700', card.ring)}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-sbi-700 dark:text-sbi-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-sbi-900 dark:text-white">{card.title}</h3>
                    <p className="text-[10px] text-sbi-400 dark:text-sbi-500 truncate max-w-[140px] sm:max-w-[200px]">{maskCardNumber(card.accNum)}</p>
                  </div>
                </div>
                {card.badge && (
                  <Badge className="bg-white/80 dark:bg-sbi-800/80 text-sbi-700 dark:text-sbi-300 border-0 text-[9px] shadow-sm">
                    {card.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5 mb-3">
                <p className="text-2xl sm:text-3xl font-bold text-sbi-900 dark:text-white tracking-tight">{f(card.balance)}</p>
                {card.trend}
                {card.subtitle && <p className="text-[10px] text-sbi-400 dark:text-sbi-500">{card.subtitle}</p>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-sbi-200/50 dark:border-sbi-700/50">
                {card.actions.map((action) => (
                  <Button key={action} variant="ghost" size="sm"
                    className="h-7 text-[10px] sm:text-xs rounded-lg text-sbi-600 dark:text-sbi-400 hover:bg-white/80 dark:hover:bg-sbi-800/80 px-2.5">
                    {action} <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────── CREDIT CARD SECTION ──────────────

function CreditCardSection() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
      {/* Card Display */}
      <div className="lg:col-span-3">
        <div className="relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setFlipped(!flipped)}>
          <div className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-br from-sbi-800 via-sbi-900 to-sbi-950 p-5 sm:p-7 transition-all duration-500',
            flipped ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          )}>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase">SBI Platinum</p>
                  <p className="text-base sm:text-lg font-bold tracking-[0.2em] text-white mt-4 font-mono">{maskCardNumber('4532123456789012')}</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-red-500 to-yellow-400 opacity-90" />
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-red-500 opacity-90" />
                </div>
              </div>
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">Card Holder</p>
                  <p className="text-sm font-semibold">Aditya Gupta</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">Expires</p>
                  <p className="text-sm font-semibold">09/28</p>
                </div>
                <div>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">CVV</p>
                  <p className="text-sm font-semibold">•••</p>
                </div>
              </div>
            </div>
          </div>
          <div className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-br from-sbi-700 to-sbi-900 p-5 sm:p-7 transition-all duration-500',
            flipped ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}>
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-white/40 tracking-[0.2em] uppercase">Card Controls</p>
                <Lock className="h-4 w-4 text-white/50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Online Payments', active: true },
                  { label: 'International', active: true },
                  { label: 'Contactless', active: true },
                  { label: 'ATM Withdrawal', active: false },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className={cn('h-3 w-6 rounded-full transition-colors relative', c.active ? 'bg-emerald-500' : 'bg-white/20')}>
                      <div className={cn('absolute top-0.5 h-2 w-2 rounded-full bg-white transition-all', c.active ? 'left-3' : 'left-0.5')} />
                    </div>
                    <span className="text-[9px] text-white/70">{c.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-white/30 text-center">Tap to flip</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        <GlassCard className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-sbi-900 dark:text-white mb-3">Card Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Credit Limit', value: '₹5,00,000', icon: Target, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Available Limit', value: '₹3,72,550', icon: CircleDollarSign, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Reward Points', value: '12,450 Pts', icon: Award, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Due Date', value: '22 Jun 2026', icon: Clock, color: 'text-red-600 dark:text-red-400' },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between py-2 border-b border-sbi-100 dark:border-sbi-800 last:border-0">
                <div className="flex items-center gap-2.5">
                  <d.icon className={cn('h-4 w-4', d.color)} />
                  <span className="text-xs text-sbi-500 dark:text-sbi-400">{d.label}</span>
                </div>
                <span className="text-xs font-semibold text-sbi-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <Button className="w-full h-10 text-xs font-semibold rounded-xl bg-gradient-to-r from-sbi-600 to-sbi-700 hover:from-sbi-700 hover:to-sbi-800 text-white shadow-lg shadow-sbi-600/20">
          Pay Now <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

// ────────────── UPI SECTION ──────────────

function UPISection() {
  const [amount, setAmount] = useState('');
  return (
    <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
      {/* QR Code */}
      <GlassCard className="p-4 sm:p-5 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="h-4 w-4 text-sbi-600 dark:text-sbi-400" />
          <h3 className="text-sm font-semibold text-sbi-900 dark:text-white">Scan to Pay</h3>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-sbi-800 shadow-inner mb-3">
          <QRCodePlaceholder />
        </div>
        <p className="text-[10px] text-sbi-400 dark:text-sbi-500 mb-1">UPI ID: <span className="font-mono font-semibold text-sbi-600 dark:text-sbi-300">aditya@sbi</span></p>
        <Badge variant="outline" className="text-[9px] border-sbi-200 dark:border-sbi-700 text-sbi-500">
          <CheckCircle className="h-2.5 w-2.5 mr-1" /> UPI Ready
        </Badge>
      </GlassCard>

      {/* Send / Request */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sbi-900 dark:text-white">Send Money</h3>
            <p className="text-[10px] text-sbi-400 dark:text-sbi-500">Instant UPI Transfer</p>
          </div>
        </div>
        <Input placeholder="Enter UPI ID / Mobile / Account" value={amount} onChange={(e) => setAmount(e.target.value)}
          className="h-9 text-xs rounded-xl border-sbi-200 dark:border-sbi-700 bg-white/80 dark:bg-sbi-800/80 mb-3" />
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {['₹500', '₹1,000', '₹2,000', '₹5,000', '₹10,000', '₹25,000'].map((v) => (
            <button key={v} onClick={() => setAmount(v)}
              className="py-1.5 text-[9px] font-medium rounded-lg border border-sbi-200 dark:border-sbi-700 text-sbi-600 dark:text-sbi-400 hover:bg-sbi-50 dark:hover:bg-sbi-800 transition-colors">
              {v}
            </button>
          ))}
        </div>
        <Button className="w-full h-9 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
          <Send className="h-3.5 w-3.5 mr-1.5" /> Send Now
        </Button>
      </GlassCard>

      {/* UPI Actions & Request */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <ScanLine className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sbi-900 dark:text-white">Quick Actions</h3>
            <p className="text-[10px] text-sbi-400 dark:text-sbi-500">UPI Services</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { icon: ScanLine, label: 'Scan & Pay', color: 'from-blue-500 to-blue-600', href: '#' },
            { icon: ArrowUpDown, label: 'Request Money', color: 'from-purple-500 to-purple-600', href: '#' },
            { icon: Users, label: 'Manage UPI ID', color: 'from-cyan-500 to-cyan-600', href: '#' },
            { icon: RefreshCw, label: 'Check Balance', color: 'from-emerald-500 to-emerald-600', href: '#' },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sbi-50 dark:hover:bg-sbi-800/50 transition-all group">
              <div className={cn('rounded-lg p-1.5 text-white bg-gradient-to-br', a.color)}>
                <a.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-sbi-700 dark:text-sbi-300">{a.label}</span>
              <ChevronRight className="h-3 w-3 ml-auto text-sbi-300 dark:text-sbi-600" />
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ────────────── RECENT TRANSACTIONS ──────────────

function RecentTransactions() {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-sbi-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs sm:text-sm text-sbi-400 dark:text-sbi-500">Your latest 8 transactions</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs text-sbi-600 dark:text-sbi-400 h-8 rounded-xl">
          View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-4">
        {(['all', 'credit', 'debit'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all',
              filter === f
                ? 'bg-sbi-600 text-white shadow-md shadow-sbi-600/20'
                : 'bg-sbi-50 dark:bg-sbi-800 text-sbi-500 dark:text-sbi-400 hover:bg-sbi-100 dark:hover:bg-sbi-700'
            )}>
            {f === 'all' ? 'All' : f === 'credit' ? 'Credits' : 'Debits'}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      <div className="space-y-1">
        {filtered.map((txn) => (
          <div key={txn.id}
            className="flex items-center gap-3 sm:gap-4 px-3 py-3 rounded-xl hover:bg-sbi-50 dark:hover:bg-sbi-800/30 transition-all cursor-pointer group">
            <div className={cn('rounded-xl p-2 sm:p-2.5 shrink-0', TransactionColor({ type: txn.type }))}>
              <TransactionIcon category={txn.category} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-semibold text-sbi-900 dark:text-white truncate">{txn.desc}</p>
                <p className={cn('text-xs sm:text-sm font-bold whitespace-nowrap',
                  txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </p>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-sbi-400 dark:text-sbi-500">{txn.date}</span>
                  <span className="text-[8px] text-sbi-300 dark:text-sbi-600">|</span>
                  <span className="text-[10px] text-sbi-400 dark:text-sbi-500">{txn.account}</span>
                </div>
                <Badge variant={txn.status === 'success' ? 'success' : 'warning'} className="text-[8px] h-4 px-1.5">
                  {txn.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ────────────── ANALYTICS SECTION ──────────────

function AnalyticsSection() {
  const [view, setView] = useState<'spending' | 'income'>('spending');
  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Spending / Income Chart */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-sbi-900 dark:text-white">
              {view === 'spending' ? 'Monthly Spending' : 'Income vs Expense'}
            </h3>
            <p className="text-[10px] sm:text-xs text-sbi-400 dark:text-sbi-500">Last 7 months overview</p>
          </div>
          <div className="flex gap-1 bg-sbi-100 dark:bg-sbi-800 rounded-lg p-0.5">
            {(['spending', 'income'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-medium rounded-md transition-all',
                  view === v ? 'bg-white dark:bg-sbi-700 text-sbi-900 dark:text-white shadow-sm' : 'text-sbi-500 dark:text-sbi-400')}>
                {v === 'spending' ? 'Spending' : 'Inc vs Exp'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-44 sm:h-52">
          <SpendingChart data={monthlyData} view={view} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
          {[
            { label: 'Income', value: formatCurrency(95000), color: 'from-blue-50 to-blue-100 dark:from-blue-900/20' },
            { label: 'Spending', value: formatCurrency(48000), color: 'from-red-50 to-red-100 dark:from-red-900/20' },
            { label: 'Savings Rate', value: '49.4%', color: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20' },
            { label: 'Daily Avg', value: formatCurrency(1600), color: 'from-purple-50 to-purple-100 dark:from-purple-900/20' },
          ].map((s) => (
            <div key={s.label} className={cn('rounded-xl p-2 sm:p-3 text-center bg-gradient-to-br', s.color)}>
              <p className="text-[9px] sm:text-[10px] text-sbi-500 dark:text-sbi-400">{s.label}</p>
              <p className="text-xs sm:text-sm font-bold text-sbi-900 dark:text-white mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400">
              Spending up 12% this month. Review discretionary expenses to maintain your 50% savings rate.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Savings Growth */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-sbi-900 dark:text-white">Portfolio Growth</h3>
            <p className="text-[10px] sm:text-xs text-sbi-400 dark:text-sbi-500">Total: {formatCurrency(695000)}</p>
          </div>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px]">
            <TrendingUp className="h-3 w-3 mr-1" /> +8.2%
          </Badge>
        </div>
        <div className="h-44 sm:h-52">
          <GrowthChart data={portfolioGrowth} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
          {investmentData.slice(0, 4).map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-sbi-50 dark:bg-sbi-800/50">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] sm:text-[10px] text-sbi-500 dark:text-sbi-400">{item.name}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-sbi-900 dark:text-white">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Investment Performance */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-sbi-900 dark:text-white">Investment Portfolio</h3>
            <p className="text-[10px] sm:text-xs text-sbi-400 dark:text-sbi-500">Asset allocation</p>
          </div>
        </div>
        <div className="h-44 sm:h-52">
          <InvestmentChart data={investmentData} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {investmentData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-sbi-50 dark:bg-sbi-800/50">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] text-sbi-500 dark:text-sbi-400">{item.name}</span>
              </div>
              <span className="text-[9px] font-semibold text-sbi-900 dark:text-white">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* EMI Tracker */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-sbi-900 dark:text-white">Loan & EMI Tracker</h3>
            <p className="text-[10px] sm:text-xs text-sbi-400 dark:text-sbi-500">{loans.length} active loans</p>
          </div>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px]">
            <CheckCircle className="h-3 w-3 mr-1" /> All on track
          </Badge>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-xl bg-sbi-50 dark:bg-sbi-800/30 p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="rounded-lg p-1.5 sm:p-2 bg-gradient-to-br from-sbi-100 to-blue-100 dark:from-sbi-700 dark:to-sbi-600">
                    <loan.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sbi-600 dark:text-sbi-300" />
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs font-semibold text-sbi-900 dark:text-white">{loan.type}</p>
                    <p className="text-[9px] sm:text-[10px] text-sbi-400 dark:text-sbi-500">EMI Due: {loan.due}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] sm:text-xs font-bold text-sbi-900 dark:text-white">{formatCurrency(loan.emi)}<span className="text-[8px] font-normal text-sbi-400">/mo</span></p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-sbi-400 dark:text-sbi-500">
                  <span>{loan.progress}% Paid</span>
                  <span>Left: {formatCurrency(loan.remaining)}</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full rounded-full bg-sbi-100 dark:bg-sbi-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sbi-600 to-blue-500 transition-all duration-700"
                    style={{ width: `${loan.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ────────────── SECURITY SECTION ──────────────

function SecuritySection() {
  const items = [
    { icon: CheckCircle, label: 'KYC Status', value: 'Verified', status: 'success', detail: 'Aadhaar + PAN', color: 'from-emerald-500 to-emerald-600' },
    { icon: Smartphone, label: 'Device Security', value: 'Active', status: 'success', detail: 'iPhone 15 Pro · Maharashtra', color: 'from-blue-500 to-blue-600' },
    { icon: Shield, label: 'Two-Factor Auth', value: 'Enabled', status: 'success', detail: 'SMS + Biometric', color: 'from-purple-500 to-purple-600' },
    { icon: Lock, label: 'Fraud Protection', value: 'Active', status: 'success', detail: 'Real-time monitoring', color: 'from-cyan-500 to-cyan-600' },
  ];
  const [showAlerts, setShowAlerts] = useState(false);
  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sbi-900 dark:text-white">Security & Safety</h2>
            <p className="text-xs sm:text-sm text-sbi-400 dark:text-sbi-500">Your account protection status</p>
          </div>
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0 text-[10px]">
            <Shield className="h-3 w-3 mr-1" /> All Secure
          </Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-sbi-50 dark:from-sbi-900 dark:to-sbi-800 border border-sbi-100 dark:border-sbi-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className={cn('rounded-xl p-2.5 text-white bg-gradient-to-br shadow-md shrink-0', item.color)}>
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-sbi-900 dark:text-white">{item.label}</p>
                    <Badge variant="success" className="text-[8px] h-4 px-1.5">{item.value}</Badge>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-sbi-400 dark:text-sbi-500 mt-0.5">{item.detail}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-medium">{item.value === 'Verified' || item.value === 'Active' || item.value === 'Enabled' ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fraud Alerts side panel */}
      <div>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-1.5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-sbi-900 dark:text-white">Fraud Alerts</h3>
            </div>
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-0 text-[9px]">
              {alerts.filter(a => a.severity === 'high').length} Critical
            </Badge>
          </div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id}
                className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-sbi-50 dark:bg-sbi-800/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">
                <div className={cn('rounded-lg p-1 mt-0.5 shrink-0',
                  alert.severity === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                  alert.severity === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                )}>
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-sbi-900 dark:text-white">{alert.title}</p>
                  <p className="text-[9px] text-sbi-500 dark:text-sbi-400 mt-0.5">{alert.desc}</p>
                  <p className="text-[8px] text-sbi-400 dark:text-sbi-500 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-[9px] sm:text-[10px] text-sbi-500 hover:text-sbi-700 dark:hover:text-sbi-300 h-7 rounded-xl">
            View All Alerts <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}

// ────────────── REWARDS SECTION ──────────────

function RewardsSection() {
  const rewards = [
    { icon: Award, label: 'Reward Points', value: '12,450 Pts', color: 'from-amber-400 to-amber-500', desc: 'Earned this month' },
    { icon: Coins, label: 'Cashback Earned', value: formatCurrency(2850), color: 'from-emerald-400 to-emerald-500', desc: 'This year so far' },
    { icon: Gift, label: 'Special Offers', value: '5 Active', color: 'from-purple-400 to-purple-500', desc: 'Exclusive for you' },
    { icon: Star, label: 'Premium Tier', value: 'Platinum', color: 'from-blue-400 to-blue-500', desc: 'Top tier benefits' },
  ];
  const offers = [
    { icon: ShoppingBag, title: '10% Cashback on Amazon', desc: 'Max ₹500 per transaction', color: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' },
    { icon: Home, title: 'Home Loan at 7.5% p.a.', desc: 'Special rate for premium customers', color: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' },
    { icon: Phone, title: 'Free Mobile Insurance', desc: 'Worth ₹2,499 on bill payment', color: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' },
    { icon: Wifi, title: 'Zero Forex Markup', desc: 'On international transactions', color: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-sbi-900 dark:text-white">Rewards & Offers</h2>
          <p className="text-xs sm:text-sm text-sbi-400 dark:text-sbi-500">Exclusive benefits for premium members</p>
        </div>
        <Button size="sm" className="h-8 sm:h-9 text-[10px] sm:text-xs rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-600/20">
          <Gift className="h-3.5 w-3.5 mr-1.5" /> Redeem Rewards
        </Button>
      </div>

      {/* Rewards Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {rewards.map((r) => (
          <div key={r.label} className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-sbi-50 dark:from-sbi-900 dark:to-sbi-800 border border-sbi-100 dark:border-sbi-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className={cn('inline-flex rounded-xl p-2.5 text-white bg-gradient-to-br shadow-md mb-3 sm:mb-4', r.color)}>
              <r.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-sbi-900 dark:text-white">{r.value}</p>
            <p className="text-[10px] sm:text-xs text-sbi-500 dark:text-sbi-400 mt-0.5">{r.label}</p>
            <p className="text-[8px] sm:text-[9px] text-sbi-400 dark:text-sbi-500 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Special Offers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {offers.map((offer) => (
          <div key={offer.title} className={cn('group cursor-pointer rounded-2xl p-4 sm:p-5 bg-gradient-to-br border border-white/50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5', offer.color)}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-xl p-2 bg-white/80 dark:bg-sbi-800/80 shadow-sm">
                <offer.icon className="h-4 w-4 text-sbi-700 dark:text-sbi-300" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-sbi-900 dark:text-white flex-1">{offer.title}</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-sbi-500 dark:text-sbi-400 mb-3">{offer.desc}</p>
            <Button variant="ghost" size="sm" className="h-7 text-[9px] sm:text-[10px] rounded-lg text-sbi-600 dark:text-sbi-400 hover:bg-white/80 dark:hover:bg-sbi-800/80 px-2">
              Claim Now <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────── SKELETON ──────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <SkeletonBlock className="h-56 sm:h-64" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-36" />)}
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <SkeletonBlock className="lg:col-span-3 h-48" />
        <SkeletonBlock className="lg:col-span-2 h-48" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-44" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
      <SkeletonBlock className="h-72" />
    </div>
  );
}

// ────────────── MAIN PAGE ──────────────

export default function DashboardIndex() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  const { data: accountsRes, isLoading: acctLoading } = useQuery({
    queryKey: ['accounts'], queryFn: () => accountApi.getAll(),
    enabled: isAuthenticated && user?.role === UserRole.PERSONAL_CUSTOMER,
  });

  React.useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BANK_ADMIN) router.push('/dashboard/admin');
    else if ([UserRole.CORPORATE_ADMIN, UserRole.FINANCE_MANAGER, UserRole.EMPLOYEE].includes(user?.role as UserRole)) router.push('/dashboard/corporate');
  }, [user, isAuthenticated, router]);

  if (!user) return null;
  if (user.role !== UserRole.PERSONAL_CUSTOMER) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sbi-600 mx-auto mb-4" />
          <p className="text-sm text-sbi-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const accounts = accountsRes?.data?.data || [];
  const totalBalance = accounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
  const isLoading = acctLoading;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 pb-6 sm:pb-10 animate-fade-in">
      <HeroSection accounts={accounts} totalBalance={totalBalance} />
      <AccountOverview accounts={accounts} />
      <CreditCardSection />
      <UPISection />
      <RecentTransactions />
      <AnalyticsSection />
      <SecuritySection />
      <RewardsSection />
    </div>
  );
}
