'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { auditLogApi } from '@/services/api';
import { formatDateTime, cn } from '@/lib/utils';
import { Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_BADGE: Record<string, 'success' | 'default' | 'secondary' | 'warning' | 'destructive'> = {
  LOGIN: 'success',
  REGISTER: 'success',
  LOGOUT: 'warning',
  TRANSACTION: 'default',
  TRANSFER: 'default',
  PAYMENT: 'default',
  PROFILE_UPDATE: 'secondary',
  PASSWORD_CHANGE: 'secondary',
  FAILED_LOGIN: 'destructive',
  ACCOUNT_OPEN: 'default',
  ACCOUNT_CLOSE: 'destructive',
};

const DATE_RANGES = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
  { label: 'All', value: '' },
];

const ACTION_FILTERS = [
  'All',
  'LOGIN',
  'LOGOUT',
  'TRANSACTION',
  'PAYMENT',
  'PROFILE_UPDATE',
  'PASSWORD_CHANGE',
  'ACCOUNT_OPEN',
  'ACCOUNT_CLOSE',
  'FAILED_LOGIN',
];

const PER_PAGE = 15;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogApi.getMyLogs({ limit: 100 }),
  });

  const allLogs = logsRes?.data?.data || [];

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log: any) => {
      if (actionFilter !== 'All' && log.action !== actionFilter) return false;
      if (dateRange) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(dateRange));
        if (new Date(log.createdAt) < cutoff) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const resource = (log.resource || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        if (!resource.includes(q) && !details.includes(q)) return false;
      }
      return true;
    });
  }, [allLogs, actionFilter, dateRange, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('ellipsis');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-sbi-900">Audit Log</h1>
        <p className="text-sbi-500">Track all activities on your account</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-sbi-500">Action</Label>
              <select
                className="flex h-9 rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={actionFilter}
                onChange={(e) => handleActionChange(e.target.value)}
              >
                {ACTION_FILTERS.map((a) => (
                  <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-sbi-500">Period</Label>
              <select
                className="flex h-9 rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                {DATE_RANGES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sbi-400" />
              <Input
                className="pl-8"
                placeholder="Search resource or details..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-5 w-24 bg-sbi-100 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-sbi-100 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-sbi-100 rounded animate-pulse" />
                  <div className="h-5 w-48 bg-sbi-100 rounded animate-pulse flex-1" />
                  <div className="h-5 w-24 bg-sbi-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-sbi-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : paginatedLogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-sbi-300" />
            <h3 className="mt-4 text-lg font-medium text-sbi-900">No audit logs found</h3>
            <p className="mt-1 text-sm text-sbi-500">
              {searchTerm || actionFilter !== 'All' || dateRange
                ? 'Try adjusting your filters to see more results'
                : 'There are no recorded activities yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[100px]">Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[120px]">IP Address</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={ACTION_BADGE[log.action] || 'secondary'} className="uppercase text-[10px]">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{log.resource || '-'}</TableCell>
                      <TableCell className="text-xs max-w-[240px] truncate" title={log.details}>
                        {log.details || '-'}
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.ipAddress || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success' ? 'success' :
                            log.status === 'failure' ? 'destructive' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-sbi-500">
              Showing {(safePage - 1) * PER_PAGE + 1}-
              {Math.min(safePage * PER_PAGE, filteredLogs.length)} of {filteredLogs.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              {pageNumbers.map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-xs text-sbi-400">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safePage ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-[36px]"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
