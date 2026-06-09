'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import {
  Moon, Sun, Menu, X, User, LogOut, ChevronDown,
  Bell, BellDot, CheckCheck, ArrowRightLeft, Fingerprint,
  Landmark, Building2, Shield, Megaphone, Settings, Lock,
  Search, Home, CreditCard, PiggyBank, HeartHandshake,
  ChevronRight, Banknote, Users, HandCoins,
  ScrollText, FileText, Sparkles, Phone,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getInitials, timeAgo, cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/services/api';
import type { Notification as NotificationType } from '@/types';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  TRANSACTION: <ArrowRightLeft className="h-4 w-4" />,
  KYC: <Fingerprint className="h-4 w-4" />,
  LOAN: <Landmark className="h-4 w-4" />,
  ACCOUNT: <Building2 className="h-4 w-4" />,
  SECURITY: <Shield className="h-4 w-4" />,
  PROMOTIONAL: <Megaphone className="h-4 w-4" />,
  SYSTEM: <Settings className="h-4 w-4" />,
};

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: Building2,
    megaMenu: [
      { title: 'Savings Account', desc: 'Earn up to 7% interest on your savings', href: '/accounts/savings', icon: PiggyBank, badge: 'Popular' },
      { title: 'Current Account', desc: 'Tailored for your business needs', href: '/accounts/current', icon: Building2 },
      { title: 'Salary Account', desc: 'Exclusive salary benefits & perks', href: '/accounts/salary', icon: Users, badge: 'New' },
      { title: 'NRI Account', desc: 'Banking solutions for NRIs', href: '/accounts/nri', icon: Banknote },
    ],
  },
  {
    label: 'Loans',
    href: '/loans',
    icon: Landmark,
    megaMenu: [
      { title: 'Home Loan', desc: 'Make your dream home a reality', href: '/loans/home', icon: Home, badge: '8.50%' },
      { title: 'Car Loan', desc: 'Drive home your dream car today', href: '/loans/car', icon: CreditCard, badge: '9.25%' },
      { title: 'Personal Loan', desc: 'Instant approval, minimal documents', href: '/loans/personal', icon: HandCoins, badge: '10.50%' },
      { title: 'Education Loan', desc: 'Invest in your future', href: '/loans/education', icon: ScrollText },
      { title: 'Business Loan', desc: 'Fuel your business growth', href: '/loans/business', icon: Landmark },
      { title: 'Gold Loan', desc: 'Loans against gold ornaments', href: '/loans/gold', icon: PiggyBank, badge: '7.50%' },
    ],
  },
  {
    label: 'Credit Cards',
    href: '/credit-cards',
    icon: CreditCard,
    megaMenu: [
      { title: 'Platinum Card', desc: 'Premium lifestyle & travel rewards', href: '/credit-cards', icon: CreditCard, badge: 'Premium' },
      { title: 'Gold Card', desc: 'Everyday rewards & cashback', href: '/credit-cards', icon: FileText },
      { title: 'Apply Now', desc: 'Get your card in 5 minutes', href: '/credit-cards/apply', icon: Sparkles },
    ],
  },
  { label: 'Investments', href: '/investments', icon: PiggyBank },
  { label: 'Insurance', href: '/insurance', icon: HeartHandshake },
  { label: 'Support', href: '/support', icon: Settings },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, handler]);
}

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const headerRef = useRef<HTMLDivElement>(null);

  const isOnDashboard = !!onSidebarToggle;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(searchRef, () => { setSearchOpen(false); setSearchQuery(''); });

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await notificationApi.getUnreadCount();
      return res.data.data?.count ?? 0;
    },
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: async () => {
      const res = await notificationApi.getAll({ page: 1, limit: 5 });
      return (res.data.data?.notifications ?? res.data.data ?? []) as NotificationType[];
    },
    enabled: isAuthenticated && notifOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  const handleNotifClick = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const handleMegaEnter = (label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setActiveMega(label);
  };

  const handleMegaLeave = () => {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 150);
  };

  const showMega = (item: typeof NAV_ITEMS[number]) => item.megaMenu && activeMega === item.label;

  const iconBtnClass = 'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-premium-blue dark:hover:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 active:scale-90 transition-all duration-200';

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8" />
      </header>
    );
  }

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'group/header sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.3)] border-b border-premium-blue/5 dark:border-white/5'
            : 'bg-white/95 dark:bg-slate-900/95 border-b border-transparent'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-premium-blue via-premium-gold to-premium-blue opacity-60" />

        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link
            href={isAuthenticated && isOnDashboard ? '/dashboard' : '/'}
            className="flex items-center gap-2 sm:gap-3 shrink-0 group/logo relative"
          >
            <Image
              src="/image/logo.png"
              alt="SBI Finance"
              width={36}
              height={36}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain"
            />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const hasMega = item.megaMenu && item.megaMenu.length > 0;
              const megaOpen = activeMega === item.label;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMegaEnter(item.label)}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-1.5 px-2.5 xl:px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group/link whitespace-nowrap',
                      active || megaOpen
                        ? 'text-premium-blue dark:text-premium-gold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-premium-blue dark:hover:text-premium-gold'
                    )}
                  >
                    <item.icon className={cn(
                      'h-4 w-4 transition-all duration-300',
                      (active || megaOpen) && 'scale-110'
                    )} />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.label}</span>
                    {hasMega && (
                      <ChevronDown className={cn(
                        'h-3 w-3 transition-all duration-300',
                        megaOpen && 'rotate-180 translate-y-0.5'
                      )} />
                    )}
                    <span className={cn(
                      'absolute -bottom-[5px] left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300',
                      active
                        ? 'w-[60%] bg-premium-blue dark:bg-premium-gold shadow-sm shadow-premium-blue/30'
                        : 'w-0 group-hover/link:w-[40%] bg-premium-blue/60 dark:bg-premium-gold/60'
                    )} />
                  </Link>

                  {hasMega && showMega(item) && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-3"
                      onMouseEnter={() => handleMegaEnter(item.label)}
                      onMouseLeave={handleMegaLeave}
                    >
                      <div className={cn(
                        'w-[580px] rounded-2xl border border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 p-2',
                      )}>
                        <div className="grid grid-cols-2 gap-1">
                          {item.megaMenu!.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className="flex items-start gap-3 rounded-xl p-3 hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 transition-all duration-200 group/mega relative"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-premium-blue/10 dark:bg-premium-blue/20 text-premium-blue dark:text-premium-gold group-hover/mega:bg-premium-blue group-hover/mega:text-white dark:group-hover/mega:bg-premium-gold dark:group-hover/mega:text-premium-dark transition-all duration-300 group-hover/mega:scale-110 group-hover/mega:shadow-lg group-hover/mega:shadow-premium-blue/20">
                                {sub.icon ? <sub.icon className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover/mega:text-premium-blue dark:group-hover/mega:text-premium-gold transition-colors">
                                    {sub.title}
                                  </p>
                                  {sub.badge && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider bg-premium-gold/15 text-premium-gold border border-premium-gold/20">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{sub.desc}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover/mega:opacity-100 group-hover/mega:translate-x-0 transition-all duration-200" />
                            </Link>
                          ))}
                        </div>
                        <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-premium-blue via-premium-blue to-premium-dark flex items-center justify-between relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                          <div className="relative">
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-premium-gold" />
                              Need help choosing?
                            </p>
                            <p className="text-xs text-white/70 mt-0.5">Talk to our relationship manager</p>
                          </div>
                          <Button size="sm" className="relative rounded-xl bg-white text-premium-blue hover:bg-gray-100 shadow-lg text-xs font-semibold px-5 hover:scale-105 hover:shadow-xl transition-all duration-200 active:scale-95">
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Get Help
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Secure Badge (xl only) */}
            <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 group/badge hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
              <div className="relative">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap tracking-wide leading-tight">
                  256-bit Secure Banking
                </span>
                <span className="text-[8px] text-emerald-500 dark:text-emerald-400 leading-tight">PCI-DSS Certified</span>
              </div>
            </div>

            {/* Search - always visible */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={iconBtnClass}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Theme toggle - desktop only */}
            <div className="hidden lg:flex">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={iconBtnClass}
              >
                <div className="relative">
                  {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
                </div>
              </button>
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className={cn(iconBtnClass, 'relative')}
                >
                  {unreadCount > 0 ? (
                    <BellDot className="h-[18px] w-[18px]" />
                  ) : (
                    <Bell className="h-[18px] w-[18px]" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[9px] font-bold text-white shadow-sm shadow-red-500/30 ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-[380px] rounded-2xl border border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 overflow-hidden max-sm:fixed max-sm:inset-x-4 max-sm:w-auto max-sm:mt-2">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg p-1.5 bg-premium-blue/10 dark:bg-premium-blue/20">
                          <Bell className="h-3.5 w-3.5 text-premium-blue dark:text-premium-gold" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                        {unreadNotifications > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-premium-blue dark:bg-premium-gold animate-pulse" />
                        )}
                      </div>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={() => markAllAsReadMutation.mutate()}
                          className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                          <div className="rounded-full bg-gray-50 dark:bg-slate-700/50 p-4 mb-4">
                            <Bell className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No notifications</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You&apos;re all caught up</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotifClick(notif._id)}
                            className={cn(
                              'flex w-full gap-3.5 border-b border-gray-50 dark:border-slate-700/30 px-5 py-4 text-left transition-all hover:bg-gray-50 dark:hover:bg-slate-700/30',
                              !notif.isRead && 'bg-premium-blue/[0.02] dark:bg-premium-blue/[0.05]'
                            )}
                          >
                            <div className={cn(
                              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                              !notif.isRead
                                ? 'bg-premium-blue/10 dark:bg-premium-blue/20 text-premium-blue dark:text-premium-gold'
                                : 'bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500'
                            )}>
                              {NOTIFICATION_ICONS[notif.type] ?? <Bell className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  'text-xs truncate',
                                  !notif.isRead ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                  {notif.title}
                                </p>
                                {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-premium-blue dark:bg-premium-gold" />}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{timeAgo(notif.createdAt)}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-1 border-t border-gray-100 dark:border-slate-700/50 px-5 py-3.5 text-[11px] font-medium text-premium-blue dark:text-premium-gold hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all group"
                    >
                      View all notifications
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Auth - desktop only */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-label="Profile menu"
                    className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 active:scale-95 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-premium-blue/20 dark:ring-premium-gold/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-900">
                      <AvatarFallback className="bg-gradient-to-br from-premium-blue to-premium-dark text-white text-[10px] font-semibold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-300',
                      profileOpen && 'rotate-180'
                    )} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 py-2 overflow-hidden">
                      <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-700/50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.fullName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 hover:text-premium-blue dark:hover:text-premium-gold transition-colors"
                      >
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        Profile Settings
                      </Link>
                      <div className="border-t border-gray-50 dark:border-slate-700/30 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="h-9 text-xs font-semibold rounded-xl px-5 border-premium-blue/25 dark:border-premium-blue/40 text-premium-blue dark:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 hover:border-premium-blue/50 dark:hover:border-premium-gold/50 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="h-9 text-xs font-semibold rounded-xl px-5 bg-gradient-to-r from-premium-blue via-premium-blue to-premium-dark text-white shadow-lg shadow-premium-blue/25 hover:shadow-xl hover:shadow-premium-blue/30 hover:scale-105 active:scale-95 transition-all duration-200 hover:from-premium-blue hover:to-premium-dark relative overflow-hidden group/cta">
                    <Link href="/auth/register" className="relative flex items-center gap-1.5">
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)] opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center gap-1.5">
                        Open Account
                        <Sparkles className="h-3 w-3 opacity-70 group-hover/cta:opacity-100 group-hover/cta:rotate-12 transition-all duration-300" />
                      </span>
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Hamburger menu - mobile only */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-premium-blue dark:hover:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 active:scale-90 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 sm:pt-20 px-4" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            ref={searchRef}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 px-6 py-5 border-b border-gray-100 dark:border-slate-700/50">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search accounts, transactions, loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent border-0 outline-none focus:outline-none"
                autoFocus
              />
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <span className="text-premium-blue dark:text-premium-gold">ESC</span>
              </div>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Quick Links</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Account Summary', icon: Building2 },
                  { label: 'Fund Transfer', icon: ArrowRightLeft },
                  { label: 'Apply for Loan', icon: Landmark },
                  { label: 'Credit Cards', icon: CreditCard },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href="#"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3.5 rounded-xl p-3.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-premium-blue dark:hover:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 transition-all duration-200 group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium-blue/10 dark:bg-premium-blue/20 text-premium-blue dark:text-premium-gold group-hover:bg-premium-blue group-hover:text-white dark:group-hover:bg-premium-gold dark:group-hover:text-premium-dark transition-all duration-200">
                      <link.icon className="h-4 w-4" />
                    </div>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 overflow-y-auto animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <Link href="/" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-3">
                <Image
                  src="/image/logo.png"
                  alt="SBI Finance"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-xl object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Info (when logged in) */}
            {isAuthenticated && user && (
              <div className="mx-4 mt-4 flex items-center gap-3.5 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <Avatar className="h-10 w-10 ring-2 ring-premium-blue/20 dark:ring-premium-gold/30">
                  <AvatarFallback className="bg-gradient-to-br from-premium-blue to-premium-dark text-white text-xs font-semibold">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Mobile Nav Items */}
            <div className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const hasMega = item.megaMenu && item.megaMenu.length > 0;
                const active = isActive(item.href);
                const expanded = mobileExpanded[item.label] ?? false;
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (hasMega) { e.preventDefault(); setMobileExpanded(prev => ({ ...prev, [item.label]: !expanded })); }
                        else setMobileDrawerOpen(false);
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                        active
                          ? 'text-premium-blue dark:text-premium-gold bg-premium-blue/5 dark:bg-premium-blue/20'
                          : 'text-gray-700 dark:text-gray-300 hover:text-premium-blue dark:hover:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10'
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                          active
                            ? 'bg-premium-blue/10 dark:bg-premium-blue/20 text-premium-blue dark:text-premium-gold'
                            : 'text-gray-400 dark:text-gray-500'
                        )}>
                          <item.icon className="h-[18px] w-[18px]" />
                        </div>
                        {item.label}
                      </div>
                      {hasMega && (
                        <ChevronDown className={cn(
                          'h-4 w-4 text-gray-400 dark:text-gray-500 transition-all duration-300',
                          expanded && 'rotate-180'
                        )} />
                      )}
                    </Link>
                    {hasMega && expanded && (
                      <div className="ml-5 pl-5 border-l-2 border-premium-blue/20 dark:border-premium-gold/20 space-y-0.5 pb-1 mt-0.5 overflow-hidden animate-fade-in-down">
                        {item.megaMenu!.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-premium-blue dark:hover:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 transition-all duration-200"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-premium-blue/10 dark:bg-premium-blue/20 text-premium-blue dark:text-premium-gold">
                              {sub.icon ? <sub.icon className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </div>
                            <div className="flex items-center gap-2">
                              {sub.title}
                              {sub.badge && (
                                <span className="text-[8px] font-semibold uppercase tracking-wider text-premium-gold bg-premium-gold/10 px-1.5 py-0.5 rounded">
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-5 space-y-3">
              {!isAuthenticated ? (
                <>
                  <Button asChild variant="outline" className="w-full rounded-xl h-12 text-sm font-semibold border-premium-blue/25 dark:border-premium-blue/40 text-premium-blue dark:text-premium-gold hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10">
                    <Link href="/auth/login" onClick={() => setMobileDrawerOpen(false)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl h-12 text-sm font-semibold bg-gradient-to-r from-premium-blue to-premium-dark text-white shadow-lg shadow-premium-blue/25 hover:shadow-xl hover:shadow-premium-blue/30 hover:scale-[1.02] active:scale-95 transition-all duration-200">
                    <Link href="/auth/register" onClick={() => setMobileDrawerOpen(false)}>Open Account</Link>
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
                    <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">256-bit Secure Banking</span>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-premium-blue/5 dark:hover:bg-premium-blue/10 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {theme === 'dark' ? <Sun className="h-4 w-4 inline mr-2" /> : <Moon className="h-4 w-4 inline mr-2" />}
                  Dark Mode
                </span>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-all duration-300',
                    theme === 'dark' ? 'bg-premium-blue dark:bg-premium-gold' : 'bg-gray-200 dark:bg-slate-700'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center',
                    theme === 'dark' && 'translate-x-5'
                  )}>
                    {theme === 'dark' ? <Sun className="h-3 w-3 text-premium-gold" /> : <Moon className="h-3 w-3 text-gray-500" />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
