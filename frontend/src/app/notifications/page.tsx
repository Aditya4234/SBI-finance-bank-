'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppSelector } from '@/store/hooks';
import { notificationApi } from '@/services/api';
import { cn, timeAgo } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import {
  Bell, ArrowRightLeft, Fingerprint, Landmark, Building2,
  Shield, Megaphone, Settings, X, CheckCheck, Trash2, RefreshCw,
  AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react';
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

export default function NotificationsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'all', page],
    queryFn: async () => {
      const res = await notificationApi.getAll({ page, limit });
      return {
        notifications: (res.data.data?.notifications ?? res.data.data ?? []) as NotificationType[],
        pagination: res.data.pagination,
      };
    },
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to mark as read', variant: 'error' }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      addToast({ title: 'All notifications marked as read', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to mark all as read', variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to delete notification', variant: 'error' }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationApi.clearAll(),
    onSuccess: () => {
      addToast({ title: 'All notifications cleared', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to clear notifications', variant: 'error' }),
  });

  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages = pagination?.totalPages ?? 1;

  if (!isAuthenticated) {
    return (
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-sbi-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-sbi-900 mb-2">Notifications</h2>
            <p className="text-sbi-500 mb-4">Please sign in to view your notifications.</p>
            <Button asChild>
              <a href="/auth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Notifications</h1>
          <p className="text-sbi-500">Stay updated with your account activity</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending}>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => clearAllMutation.mutate()} disabled={clearAllMutation.isPending}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        {isLoading && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-sbi-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 rounded bg-sbi-100" />
                      <div className="h-3 w-64 rounded bg-sbi-100" />
                      <div className="h-3 w-24 rounded bg-sbi-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <TabsContent value={filter} className="mt-4">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-sbi-600 mb-3">Failed to load notifications</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-3 w-3 mr-2" /> Retry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isLoading && !isError && (
          <TabsContent value={filter} className="mt-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-sbi-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sbi-900 mb-1">No notifications</h3>
                  <p className="text-sm text-sbi-500">
                    {filter === 'all' ? 'You have no notifications yet.' : filter === 'unread' ? 'All caught up!' : 'No read notifications.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notif) => (
                  <Card
                    key={notif._id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-sbi-50 dark:hover:bg-sbi-800/50',
                      !notif.isRead && 'border-l-4 border-l-blue-500'
                    )}
                    onClick={() => {
                      if (!notif.isRead) {
                        markAsReadMutation.mutate(notif._id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          !notif.isRead
                            ? 'bg-sbi-100 text-sbi-700 dark:bg-sbi-700 dark:text-sbi-200'
                            : 'bg-sbi-50 text-sbi-400 dark:bg-sbi-800 dark:text-sbi-500'
                        )}>
                          {NOTIFICATION_ICONS[notif.type] ?? <Bell className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className={cn(
                                'text-sm truncate',
                                !notif.isRead ? 'font-semibold text-sbi-900 dark:text-sbi-100' : 'text-sbi-700 dark:text-sbi-300'
                              )}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(notif._id);
                              }}
                              className="shrink-0 rounded-full p-1 text-sbi-400 hover:bg-sbi-100 hover:text-sbi-600 dark:hover:bg-sbi-700 dark:hover:text-sbi-300"
                              aria-label="Delete notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-sbi-600 dark:text-sbi-400">{notif.message}</p>
                          <p className="mt-1 text-xs text-sbi-400 dark:text-sbi-500">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-sbi-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
