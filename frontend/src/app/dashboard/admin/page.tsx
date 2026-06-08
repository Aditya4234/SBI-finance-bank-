'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import {
  Users, Building2, Landmark, Wallet,
  Download, RefreshCw, XCircle, CheckCircle, AlertTriangle, Activity, Loader2, ChevronDown, TrendingUp, ShieldAlert, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6'];

function formatChartCurrency(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function extractData(res: any, fallback: any = []) {
  if (!res) return fallback;
  if (Array.isArray(res)) return res;
  if (res?.data?.data) return res.data.data;
  if (res?.data) return Array.isArray(res.data) ? res.data : res.data;
  return fallback;
}

function extractObject(res: any, fallback: any = {}) {
  if (!res) return fallback;
  if (res?.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data)) return res.data.data;
  if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data;
  return fallback;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showRejectKyc, setShowRejectKyc] = useState(false);
  const [rejectKycId, setRejectKycId] = useState('');
  const [rejectKycRemarks, setRejectKycRemarks] = useState('');
  const [showRejectLoan, setShowRejectLoan] = useState(false);
  const [rejectLoanId, setRejectLoanId] = useState('');
  const [rejectLoanRemarks, setRejectLoanRemarks] = useState('');
  const [showDisburse, setShowDisburse] = useState(false);
  const [disburseLoanId, setDisburseLoanId] = useState('');
  const [disburseAccount, setDisburseAccount] = useState('');
  const [showExport, setShowExport] = useState(false);

  const { data: dashRes, isLoading: dashLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.getDashboard() });
  const { data: loansRes, isLoading: loansLoading } = useQuery({ queryKey: ['admin-loans'], queryFn: () => adminApi.getLoans() });
  const { data: kycRes, isLoading: kycLoading } = useQuery({ queryKey: ['admin-kyc'], queryFn: () => adminApi.getPendingKyc() });
  const { data: queueRes, isLoading: queueLoading } = useQuery({ queryKey: ['queue-metrics'], queryFn: () => adminApi.getQueueMetrics(), refetchInterval: 10000 });

  const { data: revenueRes, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => adminApi.getRevenue('monthly'),
  });

  const { data: fraudRes, isLoading: fraudLoading } = useQuery({
    queryKey: ['admin-fraud'],
    queryFn: () => adminApi.getFraud(),
  });

  const approveKycMut = useMutation({
    mutationFn: (documentId: string) => adminApi.approveKyc(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      addToast({ title: 'KYC Approved', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to approve KYC', variant: 'error' }),
  });

  const rejectKycMut = useMutation({
    mutationFn: ({ documentId, remarks }: { documentId: string; remarks: string }) =>
      adminApi.rejectKyc(documentId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      addToast({ title: 'KYC Rejected', variant: 'success' });
      setShowRejectKyc(false);
      setRejectKycRemarks('');
    },
    onError: () => addToast({ title: 'Failed to reject KYC', variant: 'error' }),
  });

  const approveLoanMut = useMutation({
    mutationFn: (loanId: string) => adminApi.approveLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      addToast({ title: 'Loan Approved', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to approve loan', variant: 'error' }),
  });

  const rejectLoanMut = useMutation({
    mutationFn: ({ loanId, remarks }: { loanId: string; remarks: string }) =>
      adminApi.rejectLoan(loanId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      addToast({ title: 'Loan Rejected', variant: 'success' });
      setShowRejectLoan(false);
      setRejectLoanRemarks('');
    },
    onError: () => addToast({ title: 'Failed to reject loan', variant: 'error' }),
  });

  const disburseLoanMut = useMutation({
    mutationFn: ({ loanId, accountNumber }: { loanId: string; accountNumber: string }) =>
      adminApi.disburseLoan(loanId, accountNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      addToast({ title: 'Loan Disbursed', variant: 'success' });
      setShowDisburse(false);
      setDisburseAccount('');
    },
    onError: () => addToast({ title: 'Failed to disburse loan', variant: 'error' }),
  });

  const retryJobsMut = useMutation({
    mutationFn: () => adminApi.retryFailedJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-metrics'] });
      addToast({ title: 'Retrying failed jobs', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to retry jobs', variant: 'error' }),
  });

  const stats = dashRes?.data?.data || {};
  const loans = loansRes?.data?.loans || [];
  const kycDocs = kycRes?.data?.documents || [];
  const queueMetrics = queueRes?.data?.data || [];
  const actionableLoans = loans.filter((l: any) => l.status === 'pending' || l.status === 'approved');

  const revenueData = extractData(revenueRes);
  const fraudData = extractObject(fraudRes);

  let fraudPieData: { name: string; value: number; color: string }[] = [];
  if (fraudData && Object.keys(fraudData).length > 0) {
    const labels: Record<string, string> = {
      highValue: 'High Value',
      normal: 'Normal',
      flagged: 'Flagged',
      safe: 'Safe',
      suspicious: 'Suspicious',
      highValueTransactions: 'High Value',
      normalTransactions: 'Normal',
      fraudulent: 'Fraudulent',
      legitimate: 'Legitimate',
    };
    fraudPieData = Object.entries(fraudData)
      .filter(([k, v]) => typeof v === 'number' && labels[k])
      .map(([k, v], i) => ({ name: labels[k] || k, value: v as number, color: PIE_COLORS[i % PIE_COLORS.length] }));
  }
  if (fraudPieData.length === 0) {
    fraudPieData = [
      { name: 'High Value', value: 45, color: PIE_COLORS[0] },
      { name: 'Normal', value: 320, color: PIE_COLORS[1] },
    ];
  }

  const recentTxns = stats.recentTransactions || [];
  const txnTypeCounts: Record<string, number> = {};
  recentTxns.forEach((txn: any) => {
    const type = (txn.transactionType || 'unknown').toUpperCase();
    txnTypeCounts[type] = (txnTypeCounts[type] || 0) + 1;
  });
  const volumeData = Object.entries(txnTypeCounts).map(([name, count]) => ({ name, count }));

  const statCards = [
    { icon: Users, label: 'Total Customers', value: stats.totalCustomers || 0, color: 'bg-blue-100 text-blue-600' },
    { icon: Building2, label: 'Companies', value: stats.totalCompanies || 0, color: 'bg-purple-100 text-purple-600' },
    { icon: Wallet, label: 'Total Deposits', value: formatCurrency(stats.totalDeposits || 0), color: 'bg-green-100 text-green-600' },
    { icon: Landmark, label: 'Total Loans', value: formatCurrency(stats.totalLoansAmount || 0), color: 'bg-amber-100 text-amber-600' },
  ];

  const reportTypes = [
    { value: 'transactions', label: 'Transactions Report' },
    { value: 'loans', label: 'Loans Report' },
    { value: 'kyc', label: 'KYC Report' },
    { value: 'fraud', label: 'Fraud Report' },
    { value: 'daily', label: 'Daily Summary' },
    { value: 'monthly', label: 'Monthly Summary' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Admin Dashboard</h1>
          <p className="text-sbi-500">Bank-wide overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <div className="relative">
            <Button onClick={() => setShowExport(!showExport)}>
              <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-white shadow-lg py-1">
                {reportTypes.map((r) => (
                  <button
                    key={r.value}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-sbi-50"
                    onClick={() => { setShowExport(false); window.open(`/api/admin/reports/${r.value}`, '_blank'); }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sbi-500">{s.label}</p>
                  {dashLoading ? (
                    <p className="text-2xl font-bold text-sbi-300 mt-1 animate-pulse">---</p>
                  ) : (
                    <p className="text-2xl font-bold text-sbi-900 mt-1">{s.value}</p>
                  )}
                </div>
                <div className={`rounded-full ${s.color} p-3`}><s.icon className="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-sbi-500">Pending Loans</p>
              {dashLoading ? (
                <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
              ) : (
                <p className="text-2xl font-bold text-amber-600">{stats.pendingLoans || 0}</p>
              )}
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-sbi-500">Pending KYC</p>
              {dashLoading ? (
                <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
              ) : (
                <p className="text-2xl font-bold text-red-600">{stats.pendingKyc || 0}</p>
              )}
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-sbi-500">Corporate Deposits</p>
              {dashLoading ? (
                <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
              ) : (
                <p className="text-2xl font-bold text-sbi-900">{formatCurrency(stats.totalCorporateDeposits || 0)}</p>
              )}
            </div>
            <Building2 className="h-8 w-8 text-sbi-400" />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-sbi-600" />
          <h2 className="text-lg font-semibold text-sbi-900">Analytics</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sbi-600" /> Revenue Trend
              </CardTitle>
              {revenueLoading && <Loader2 className="h-4 w-4 animate-spin text-sbi-400" />}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatChartCurrency}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-sbi-600" /> Fraud Analytics
              </CardTitle>
              {fraudLoading && <Loader2 className="h-4 w-4 animate-spin text-sbi-400" />}
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={fraudPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fraudPieData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sbi-600" /> Transaction Volume by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {volumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={volumeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={48} name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-sbi-500">
                  No transaction data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Loan Approvals</CardTitle>
            <Badge variant="warning">{actionableLoans.length} Pending</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loansLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-sbi-400" /></TableCell></TableRow>
                ) : actionableLoans.slice(0, 5).map((loan: any) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">{loan.userId?.fullName || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{loan.loanType}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'pending' ? 'warning' : 'success'}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {loan.status === 'pending' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => approveLoanMut.mutate(loan._id)} disabled={approveLoanMut.isPending}>
                              {approveLoanMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { setRejectLoanId(loan._id); setShowRejectLoan(true); }}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <Button size="sm" variant="outline" className="text-blue-600" onClick={() => { setDisburseLoanId(loan._id); setShowDisburse(true); }}>
                            Disburse
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loansLoading && actionableLoans.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sbi-500">No pending loans</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending KYC Documents</CardTitle>
            <Badge variant="destructive">{kycDocs.length} Pending</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-sbi-400" /></TableCell></TableRow>
                ) : kycDocs.slice(0, 5).map((doc: any) => (
                  <TableRow key={doc._id}>
                    <TableCell className="font-medium">{doc.userId?.fullName || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{doc.kycType}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => approveKycMut.mutate(doc._id)} disabled={approveKycMut.isPending}>
                          {approveKycMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { setRejectKycId(doc._id); setShowRejectKyc(true); }}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!kycLoading && kycDocs.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sbi-500">No pending KYC</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-sbi-400" /></TableCell></TableRow>
              ) : (stats.recentTransactions || []).slice(0, 5).map((txn: any) => (
                <TableRow key={txn._id}>
                  <TableCell className="font-mono text-xs">{txn.transactionId?.slice(0, 12)}...</TableCell>
                  <TableCell>{txn.fromAccount}</TableCell>
                  <TableCell>{txn.toAccount}</TableCell>
                  <TableCell>{formatCurrency(txn.amount)}</TableCell>
                  <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{txn.transactionType}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={txn.status === 'success' ? 'success' : txn.status === 'pending' ? 'warning' : 'destructive'}>
                      {txn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(txn.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-sbi-600" /> Message Queue Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Auto-refresh every 10s</Badge>
            <Button size="sm" variant="outline" onClick={() => retryJobsMut.mutate()} disabled={retryJobsMut.isPending}>
              {retryJobsMut.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Retry Failed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {queueLoading ? (
              <div className="col-span-full text-center py-6 text-sbi-500">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading queue metrics...
              </div>
            ) : queueMetrics.map((q: any) => (
              <div key={q.name} className="rounded-lg border border-sbi-100 p-4">
                <p className="text-sm font-medium capitalize text-sbi-700 mb-3">{q.name} Queue</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-blue-50 p-2 text-center">
                    <p className="text-blue-700 font-bold">{q.metrics.waiting}</p>
                    <p className="text-blue-600">Waiting</p>
                  </div>
                  <div className="rounded bg-green-50 p-2 text-center">
                    <p className="text-green-700 font-bold">{q.metrics.active}</p>
                    <p className="text-green-600">Active</p>
                  </div>
                  <div className="rounded bg-gray-50 p-2 text-center">
                    <p className="text-gray-700 font-bold">{q.metrics.completed}</p>
                    <p className="text-gray-600">Completed</p>
                  </div>
                  <div className="rounded bg-red-50 p-2 text-center">
                    <p className="text-red-700 font-bold">{q.metrics.failed}</p>
                    <p className="text-red-600">Failed</p>
                  </div>
                </div>
              </div>
            ))}
            {!queueLoading && queueMetrics.length === 0 && (
              <div className="col-span-full text-center py-6 text-sbi-500">
                Queue metrics not available. Ensure Redis and Bull are configured.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRejectKyc} onOpenChange={setShowRejectKyc}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Remarks</Label>
              <Input value={rejectKycRemarks} onChange={(e) => setRejectKycRemarks(e.target.value)} placeholder="Enter reason for rejection..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectKyc(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => rejectKycMut.mutate({ documentId: rejectKycId, remarks: rejectKycRemarks })} disabled={!rejectKycRemarks || rejectKycMut.isPending}>
                {rejectKycMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectLoan} onOpenChange={setShowRejectLoan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Remarks</Label>
              <Input value={rejectLoanRemarks} onChange={(e) => setRejectLoanRemarks(e.target.value)} placeholder="Enter reason for rejection..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectLoan(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => rejectLoanMut.mutate({ loanId: rejectLoanId, remarks: rejectLoanRemarks })} disabled={!rejectLoanRemarks || rejectLoanMut.isPending}>
                {rejectLoanMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisburse} onOpenChange={setShowDisburse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={disburseAccount} onChange={(e) => setDisburseAccount(e.target.value)} placeholder="Enter account number for disbursement..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDisburse(false)}>Cancel</Button>
              <Button onClick={() => disburseLoanMut.mutate({ loanId: disburseLoanId, accountNumber: disburseAccount })} disabled={!disburseAccount || disburseLoanMut.isPending}>
                {disburseLoanMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Disburse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
