'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import {
  Moon, Sun, Menu, X, User, LogOut, ChevronDown,
  Bell, BellDot, CheckCheck, ArrowRightLeft, Fingerprint,
  Landmark, Building2, Shield, Megaphone, Settings, Lock,
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
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useClickOutside(notifRef, () => setNotifOpen(false));

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

  const isOnDashboard = !!onSidebarToggle;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8" />
      </header>
    );
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/80 dark:bg-sbi-950/80 backdrop-blur-xl shadow-lg shadow-sbi-900/5 border-b border-sbi-100/50 dark:border-sbi-800/50'
        : 'bg-white dark:bg-sbi-950 border-b border-sbi-100 dark:border-sbi-800'
    )}>
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Hamburger */}
        <div className="flex items-center">
          {isOnDashboard ? (
            <button
              onClick={onSidebarToggle}
              aria-label="Open sidebar"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-sbi-50 dark:bg-sbi-800 text-sbi-700 dark:text-sbi-300 hover:bg-sbi-100 dark:hover:bg-sbi-700 active:scale-95 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-sbi-50 dark:bg-sbi-800 text-sbi-700 dark:text-sbi-300 hover:bg-sbi-100 dark:hover:bg-sbi-700 active:scale-95 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Center: SBI Finance Logo */}
        <Link href={isAuthenticated && isOnDashboard ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sbi-600 to-sbi-800 text-white font-bold text-[10px] sm:text-xs shadow-md shadow-sbi-600/20 group-hover:shadow-lg group-hover:shadow-sbi-600/30 group-hover:scale-105 transition-all duration-200">
            <span className="relative z-10">SBI</span>
            <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-base font-bold text-sbi-900 dark:text-white tracking-tight">SBI Finance</span>
            <span className="hidden sm:block text-[9px] font-medium text-sbi-400 dark:text-sbi-500 -mt-0.5">State Bank of India</span>
          </div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Secure badge (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 mr-1">
            <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-300">Secure</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sbi-500 dark:text-sbi-400 hover:bg-sbi-100 dark:hover:bg-sbi-800 active:scale-95 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-sbi-500 dark:text-sbi-400 hover:bg-sbi-100 dark:hover:bg-sbi-800 active:scale-95 transition-all duration-200"
              >
                {unreadCount > 0 ? (
                  <BellDot className="h-[18px] w-[18px]" />
                ) : (
                  <Bell className="h-[18px] w-[18px]" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[9px] font-bold text-white shadow-sm shadow-red-500/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-96 rounded-2xl border border-sbi-100 dark:border-sbi-700 bg-white dark:bg-sbi-900 shadow-2xl shadow-sbi-900/10 dark:shadow-black/30 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-sbi-100 dark:border-sbi-800">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg p-1.5 bg-sbi-50 dark:bg-sbi-800">
                        <Bell className="h-3.5 w-3.5 text-sbi-600 dark:text-sbi-300" />
                      </div>
                      <h3 className="text-sm font-semibold text-sbi-900 dark:text-sbi-100">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        className="flex items-center gap-1 text-[11px] font-medium text-sbi-500 hover:text-sbi-700 dark:text-sbi-400 dark:hover:text-sbi-300 transition-colors"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-sbi-50 dark:bg-sbi-800 p-3 mb-3">
                          <Bell className="h-6 w-6 text-sbi-300 dark:text-sbi-600" />
                        </div>
                        <p className="text-sm text-sbi-500 dark:text-sbi-400">No notifications</p>
                        <p className="text-[11px] text-sbi-400 dark:text-sbi-500 mt-0.5">You&apos;re all caught up</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => handleNotifClick(notif._id)}
                          className={cn(
                            'flex w-full gap-3 border-b border-sbi-50 dark:border-sbi-800/50 px-4 py-3.5 text-left transition-all hover:bg-sbi-50 dark:hover:bg-sbi-800/50',
                            !notif.isRead && 'bg-sbi-50/30 dark:bg-sbi-800/20'
                          )}
                        >
                          <div className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                            !notif.isRead
                              ? 'bg-sbi-100 text-sbi-700 dark:bg-sbi-700 dark:text-sbi-200'
                              : 'bg-sbi-50 text-sbi-400 dark:bg-sbi-800 dark:text-sbi-500'
                          )}>
                            {NOTIFICATION_ICONS[notif.type] ?? <Bell className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                'text-xs truncate',
                                !notif.isRead ? 'font-semibold text-sbi-900 dark:text-sbi-100' : 'text-sbi-700 dark:text-sbi-300'
                              )}>
                                {notif.title}
                              </p>
                              {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                            </div>
                            <p className="text-[11px] text-sbi-500 dark:text-sbi-400 truncate mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-sbi-400 dark:text-sbi-500 mt-0.5">{timeAgo(notif.createdAt)}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <Link
                    href="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-sbi-100 dark:border-sbi-800 px-4 py-3 text-center text-[11px] font-medium text-sbi-600 hover:bg-sbi-50 dark:text-sbi-400 dark:hover:bg-sbi-800/50 transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Profile / Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
                className="flex items-center gap-1.5 rounded-xl p-1 hover:bg-sbi-50 dark:hover:bg-sbi-800 active:scale-95 transition-all duration-200"
              >
                <Avatar className="h-8 w-8 ring-2 ring-sbi-100 dark:ring-sbi-700 ring-offset-2 ring-offset-white dark:ring-offset-sbi-950">
                  <AvatarFallback className="bg-gradient-to-br from-sbi-600 to-sbi-700 text-white text-[10px] font-semibold">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className={cn(
                  'hidden sm:block h-3.5 w-3.5 text-sbi-400 dark:text-sbi-500 transition-transform duration-200',
                  profileOpen && 'rotate-180'
                )} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-sbi-100 dark:border-sbi-700 bg-white dark:bg-sbi-900 shadow-2xl shadow-sbi-900/10 dark:shadow-black/30 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-sbi-100 dark:border-sbi-800">
                    <p className="text-sm font-semibold text-sbi-900 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-[10px] text-sbi-400 dark:text-sbi-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-sbi-700 dark:text-sbi-300 hover:bg-sbi-50 dark:hover:bg-sbi-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-sbi-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs rounded-xl px-3">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="h-8 text-xs rounded-xl px-3 bg-gradient-to-r from-sbi-600 to-sbi-700 hover:from-sbi-700 hover:to-sbi-800 text-white shadow-md shadow-sbi-600/20">
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Menu (landing page only) */}
      {!isOnDashboard && mobileMenuOpen && (
        <div className="md:hidden border-t border-sbi-100 dark:border-sbi-800 bg-white/95 dark:bg-sbi-950/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-fade-in">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sbi-700 dark:text-sbi-300 hover:bg-sbi-50 dark:hover:bg-sbi-800 transition-colors">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/transfer" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sbi-700 dark:text-sbi-300 hover:bg-sbi-50 dark:hover:bg-sbi-800 transition-colors">
                Transfer
              </Link>
              <Link href="/loans" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sbi-700 dark:text-sbi-300 hover:bg-sbi-50 dark:hover:bg-sbi-800 transition-colors">
                Loans
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-3 border-t border-sbi-100 dark:border-sbi-800">
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 rounded-xl bg-gradient-to-r from-sbi-600 to-sbi-700">
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
