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
import { corporateApi, adminApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { Building2, Users, Wallet, TrendingUp, Plus, Send, X, Loader2, Lock, Unlock } from 'lucide-react';
import { CompanyDetails } from '@/components/CompanyDetails';

export default function CorporateDashboard() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);

  const [employeeData, setEmployeeData] = useState({ name: '', email: '', mobile: '', role: 'EMPLOYEE', designation: '' });

  const [bulkFromAccount, setBulkFromAccount] = useState('');
  const [payments, setPayments] = useState([{ toAccount: '', amount: '', description: '' }]);

  const { data: companyRes, isLoading: companyLoading } = useQuery({ queryKey: ['corp-company'], queryFn: () => corporateApi.getCompany() });
  const { data: accountsRes, isLoading: accountsLoading } = useQuery({ queryKey: ['corp-accounts'], queryFn: () => corporateApi.getAccounts() });
  const { data: txnsRes, isLoading: txnsLoading } = useQuery({ queryKey: ['corp-txns'], queryFn: () => corporateApi.getTransactions() });

  const addEmployeeMut = useMutation({
    mutationFn: (data: any) => corporateApi.addEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corp-company'] });
      addToast({ title: 'Employee added successfully', variant: 'success' });
      setShowAddEmployee(false);
      setEmployeeData({ name: '', email: '', mobile: '', role: 'EMPLOYEE', designation: '' });
    },
    onError: () => addToast({ title: 'Failed to add employee', variant: 'error' }),
  });

  const bulkPaymentMut = useMutation({
    mutationFn: (data: any) => corporateApi.bulkPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corp-txns'] });
      queryClient.invalidateQueries({ queryKey: ['corp-accounts'] });
      addToast({ title: 'Bulk payment submitted', variant: 'success' });
      setShowBulkPayment(false);
      setPayments([{ toAccount: '', amount: '', description: '' }]);
      setBulkFromAccount('');
    },
    onError: () => addToast({ title: 'Failed to process bulk payment', variant: 'error' }),
  });

  const freezeMut = useMutation({
    mutationFn: ({ accountId }: { accountId: string }) => adminApi.freezeAccount(accountId, 'corporate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corp-accounts'] });
      addToast({ title: 'Account frozen', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to freeze account', variant: 'error' }),
  });

  const unfreezeMut = useMutation({
    mutationFn: ({ accountId }: { accountId: string }) => adminApi.unfreezeAccount(accountId, 'corporate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corp-accounts'] });
      addToast({ title: 'Account unfrozen', variant: 'success' });
    },
    onError: () => addToast({ title: 'Failed to unfreeze account', variant: 'error' }),
  });

  const company = companyRes?.data?.data;
  const accounts = accountsRes?.data?.data || [];
  const transactions = txnsRes?.data?.transactions || [];
  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Corporate Banking</h1>
          <p className="text-sbi-500">{company?.companyName || 'Manage your business finances'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddEmployee(true)} variant="outline" className="flex-1 sm:flex-none"><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
          <Button onClick={() => setShowBulkPayment(true)} className="flex-1 sm:flex-none"><Send className="mr-2 h-4 w-4" /> Bulk Payment</Button>
        </div>
      </div>

      {companyLoading ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-sbi-400" /></CardContent>
        </Card>
      ) : company ? (
        <Card className="gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-5 w-5 text-sbi-gold" />
                  <span className="font-bold text-lg">{company.companyName}</span>
                </div>
                <p className="text-sm text-sbi-300">CIN: {company.cinNumber} | GST: {company.gstNumber}</p>
                <Badge variant={company.kycStatus === 'verified' ? 'success' : 'warning'} className="mt-2">
                  {company.kycStatus}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-sbi-300">Total Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {company && <CompanyDetails company={company} accounts={accounts} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sbi-500">Accounts</p>
                {accountsLoading ? (
                  <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
                ) : (
                  <p className="text-2xl font-bold text-sbi-900">{accounts.length}</p>
                )}
              </div>
              <div className="rounded-full bg-blue-100 p-3"><Wallet className="h-5 w-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sbi-500">Employees</p>
                {companyLoading ? (
                  <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
                ) : (
                  <p className="text-2xl font-bold text-sbi-900">{company?.employees?.length || 0}</p>
                )}
              </div>
              <div className="rounded-full bg-purple-100 p-3"><Users className="h-5 w-5 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sbi-500">Transactions</p>
                {txnsLoading ? (
                  <p className="text-2xl font-bold text-sbi-300 animate-pulse">---</p>
                ) : (
                  <p className="text-2xl font-bold text-sbi-900">{transactions.length}</p>
                )}
              </div>
              <div className="rounded-full bg-green-100 p-3"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Corporate Accounts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {accountsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-sbi-400" /></div>
            ) : accounts.map((acc: any) => (
              <div key={acc._id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium capitalize">{acc.accountType.replace('_', ' ')}</p>
                  <p className="text-xs text-sbi-500">{acc.accountNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(acc.balance)}</p>
                    <Badge variant={acc.status === 'active' ? 'success' : acc.status === 'frozen' ? 'destructive' : 'secondary'} className="text-[10px]">{acc.status}</Badge>
                  </div>
                  {acc.status === 'active' && (
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => freezeMut.mutate({ accountId: acc._id })} disabled={freezeMut.isPending}>
                      <Lock className="h-3 w-3" />
                    </Button>
                  )}
                  {acc.status === 'frozen' && (
                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => unfreezeMut.mutate({ accountId: acc._id })} disabled={unfreezeMut.isPending}>
                      <Unlock className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Corporate Transactions</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txnsLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-sbi-400" /></TableCell></TableRow>
                ) : transactions.slice(0, 5).map((txn: any) => (
                  <TableRow key={txn._id}>
                    <TableCell>{txn.toName}</TableCell>
                    <TableCell>{formatCurrency(txn.amount)}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] uppercase">{txn.transactionType}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(txn.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={employeeData.name} onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={employeeData.email} onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })} placeholder="john@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={employeeData.mobile} onChange={(e) => setEmployeeData({ ...employeeData, mobile: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                value={employeeData.role}
                onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
                className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="FINANCE_MANAGER">Finance Manager</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={employeeData.designation} onChange={(e) => setEmployeeData({ ...employeeData, designation: e.target.value })} placeholder="Software Engineer" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
              <Button onClick={() => addEmployeeMut.mutate(employeeData)} disabled={!employeeData.name || !employeeData.email || addEmployeeMut.isPending}>
                {addEmployeeMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkPayment} onOpenChange={setShowBulkPayment}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>From Account</Label>
              <select
                value={bulkFromAccount}
                onChange={(e) => setBulkFromAccount(e.target.value)}
                className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Select account</option>
                {accounts.map((acc: any) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.accountType.replace('_', ' ')} - {acc.accountNumber} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label>Payment Entries</Label>
              {payments.map((p, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-start p-3 rounded-lg border border-sbi-100">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Employee/Account"
                      value={p.toAccount}
                      onChange={(e) => {
                        const updated = [...payments];
                        updated[i] = { ...updated[i], toAccount: e.target.value };
                        setPayments(updated);
                      }}
                    />
                  </div>
                  <div className="w-full sm:w-28 space-y-1">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={p.amount}
                      onChange={(e) => {
                        const updated = [...payments];
                        updated[i] = { ...updated[i], amount: e.target.value };
                        setPayments(updated);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Description"
                      value={p.description}
                      onChange={(e) => {
                        const updated = [...payments];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setPayments(updated);
                      }}
                    />
                  </div>
                  {payments.length > 1 && (
                    <Button size="sm" variant="ghost" className="text-red-600 sm:mt-1 self-end sm:self-auto" onClick={() => setPayments(payments.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setPayments([...payments, { toAccount: '', amount: '', description: '' }])}>
                + Add Row
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="font-semibold">Total: {formatCurrency(totalPayments)}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowBulkPayment(false)}>Cancel</Button>
                <Button onClick={() => bulkPaymentMut.mutate({ fromAccount: bulkFromAccount, payments: payments.map(p => ({ ...p, amount: parseFloat(p.amount) })) })} disabled={!bulkFromAccount || payments.some(p => !p.toAccount || !p.amount) || bulkPaymentMut.isPending}>
                  {bulkPaymentMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Payment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
