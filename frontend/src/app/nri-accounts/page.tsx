'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { nriAccountApi, accountApi } from '@/services/api';
import { formatCurrency, formatDate, maskAccountNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { Globe, Plus, ExternalLink, Info } from 'lucide-react';

const nriAccountTypes = [
  { value: 'nre', label: 'NRE (Non-Resident External)', desc: 'Repatriable savings account. Deposit in foreign currency, withdraw in INR.' },
  { value: 'nro', label: 'NRO (Non-Resident Ordinary)', desc: 'Non-repatriable account for local income management.' },
  { value: 'fcnr', label: 'FCNR (Foreign Currency Non-Resident)', desc: 'Fixed deposit in foreign currency with full repatriation.' },
];

export default function NriAccountsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [form, setForm] = useState({
    accountType: 'nre',
    branchName: 'Main Branch',
    overseasAddress: '',
    foreignCurrency: 'USD',
    initialDeposit: '',
    nomineeName: '',
    nomineeRelation: '',
  });

  const { data: nriRes } = useQuery({ queryKey: ['nri-accounts'], queryFn: () => nriAccountApi.getAll() });
  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });

  const nriAccounts = nriRes?.data?.data || [];
  const localAccounts = accountsRes?.data?.data || [];

  const openNriMutation = useMutation({
    mutationFn: (data: any) => nriAccountApi.open(data),
    onSuccess: () => {
      addToast({ title: 'NRI account application submitted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['nri-accounts'] });
      setShowOpenForm(false);
      setForm({ accountType: 'nre', branchName: 'Main Branch', overseasAddress: '', foreignCurrency: 'USD', initialDeposit: '', nomineeName: '', nomineeRelation: '' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to open NRI account', variant: 'error' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openNriMutation.mutate({ ...form, initialDeposit: parseFloat(form.initialDeposit) || 0 });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">NRI Accounts</h1>
          <p className="text-sbi-500">NRE, NRO, and FCNR accounts for non-resident Indians</p>
        </div>
        <Dialog open={showOpenForm} onOpenChange={setShowOpenForm}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Open NRI Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Open NRI Account</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                  value={form.accountType}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                  required
                >
                  {nriAccountTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Overseas Address</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-sbi-200 bg-white px-3 py-2 text-sm shadow-sm resize-y"
                  placeholder="Your overseas address"
                  value={form.overseasAddress}
                  onChange={(e) => setForm({ ...form, overseasAddress: e.target.value })}
                  required
                />
              </div>
              {form.accountType === 'fcnr' && (
                <div className="space-y-2">
                  <Label>Foreign Currency</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={form.foreignCurrency}
                    onChange={(e) => setForm({ ...form, foreignCurrency: e.target.value })}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Initial Deposit ({form.accountType === 'fcnr' ? form.foreignCurrency : 'INR'})</Label>
                <Input type="number" placeholder="0" value={form.initialDeposit} onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nominee Name</Label>
                  <Input placeholder="Nominee name" value={form.nomineeName} onChange={(e) => setForm({ ...form, nomineeName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Input placeholder="Relation" value={form.nomineeRelation} onChange={(e) => setForm({ ...form, nomineeRelation: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={openNriMutation.isPending}>
                {openNriMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Your NRI Accounts</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nriAccounts.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-sbi-400 py-8">No NRI accounts yet</TableCell></TableRow>
                  )}
                  {nriAccounts.map((acc: any) => (
                    <TableRow key={acc._id}>
                      <TableCell><Badge variant="default">{acc.accountType?.toUpperCase()}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{maskAccountNumber(acc.accountNumber)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(acc.balance || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={acc.status === 'active' ? 'success' : 'secondary'}>{acc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(acc.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {localAccounts.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Transfer to NRI Account</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-sbi-500 mb-4">Use your local accounts to transfer funds to your NRI accounts.</p>
                <Button variant="outline" onClick={() => window.location.href = '/transfer'}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Go to Transfers
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4" /> NRI Account Types</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {nriAccountTypes.map((t) => (
                <div key={t.value} className="rounded-lg border p-3">
                  <h4 className="font-medium text-sm text-sbi-900 mb-1">{t.label}</h4>
                  <p className="text-xs text-sbi-500">{t.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-sbi-500 mt-0.5 shrink-0" />
                <span className="text-sbi-600">Full repatriation of funds for NRE/FCNR accounts</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-sbi-500 mt-0.5 shrink-0" />
                <span className="text-sbi-600">Tax-free interest on NRE and FCNR deposits</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-sbi-500 mt-0.5 shrink-0" />
                <span className="text-sbi-600">Easy fund transfers between India and abroad</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
