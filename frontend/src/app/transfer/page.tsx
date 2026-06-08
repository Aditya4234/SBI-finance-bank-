'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountApi, transactionApi, beneficiaryApi } from '@/services/api';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { Send, ArrowUpRight, ArrowDownLeft, UserPlus, Users, Plus } from 'lucide-react';

const transferSchema = z.object({
  fromAccount: z.string().min(1, 'Please select an account'),
  toAccount: z.string().min(1, 'Account number is required'),
  toName: z.string().min(1, 'Beneficiary name is required'),
  toIfsc: z.string().optional(),
  transactionType: z.string().min(1),
  amount: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Amount is required', invalid_type_error: 'Please enter a valid amount' })
      .positive('Amount must be greater than 0')
      .max(10000000, 'Maximum transfer amount is ₹1,00,00,000')
  ),
  description: z.string().max(200, 'Description must be under 200 characters').optional(),
});

const beneficiarySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  ifscCode: z.string().regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Please enter a valid IFSC code'),
  bankName: z.string().min(1, 'Bank name is required'),
  nickname: z.string().optional(),
});

type TransferForm = z.infer<typeof transferSchema>;
type BeneficiaryForm = z.infer<typeof beneficiarySchema>;

export default function TransferPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('transfer');

  const {
    register: tReg,
    handleSubmit: tHandleSubmit,
    setValue: tSetValue,
    watch: tWatch,
    reset: tReset,
    formState: { errors: tErrors },
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccount: '',
      toAccount: '',
      toName: '',
      toIfsc: '',
      transactionType: 'neft',
      amount: undefined as any,
      description: '',
    },
  });

  const {
    register: bReg,
    handleSubmit: bHandleSubmit,
    reset: bReset,
    formState: { errors: bErrors },
  } = useForm<BeneficiaryForm>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      nickname: '',
    },
  });

  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });
  const { data: txnsRes } = useQuery({ queryKey: ['transactions'], queryFn: () => transactionApi.getHistory() });
  const { data: benRes } = useQuery({ queryKey: ['beneficiaries'], queryFn: () => beneficiaryApi.getAll() });

  const transferMutation = useMutation({
    mutationFn: (data: any) => transactionApi.transfer(data),
    onSuccess: () => {
      addToast({ title: 'Transfer successful', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      tReset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Transfer failed', variant: 'error' }),
  });

  const beneficiaryMutation = useMutation({
    mutationFn: (data: any) => beneficiaryApi.add(data),
    onSuccess: () => {
      addToast({ title: 'Beneficiary added', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      bReset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to add beneficiary', variant: 'error' }),
  });

  const accounts = accountsRes?.data?.data || [];
  const transactions = txnsRes?.data?.transactions || [];
  const beneficiaries = benRes?.data?.data || [];

  const onTransfer = (data: TransferForm) => {
    transferMutation.mutate(data);
  };

  const onAddBeneficiary = (data: BeneficiaryForm) => {
    beneficiaryMutation.mutate(data);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-sbi-900">Transfers & Payments</h1>
        <p className="text-sbi-500">Send money, manage beneficiaries, and view history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="transfer" className="whitespace-nowrap"><Send className="mr-2 h-4 w-4" /> Transfer</TabsTrigger>
          <TabsTrigger value="beneficiaries" className="whitespace-nowrap"><Users className="mr-2 h-4 w-4" /> Beneficiaries</TabsTrigger>
          <TabsTrigger value="history" className="whitespace-nowrap"><ArrowUpRight className="mr-2 h-4 w-4" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Send Money</CardTitle><CardDescription>NEFT, RTGS, IMPS transfers</CardDescription></CardHeader>
                <CardContent>
                  <form onSubmit={tHandleSubmit(onTransfer)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>From Account</Label>
                      <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', tErrors.fromAccount && 'border-red-500')} {...tReg('fromAccount')}>
                        <option value="">Select account</option>
                        {accounts.map((acc: any, idx: number) => (
                          <option key={acc._id || idx} value={acc.accountNumber}>
                            {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      {tErrors.fromAccount && <p className="text-xs text-red-500">{tErrors.fromAccount.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Beneficiary</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                          value={tWatch('toAccount')}
                          onChange={(e) => {
                            const ben = beneficiaries.find((b: any) => b.accountNumber === e.target.value);
                            tSetValue('toAccount', e.target.value);
                            tSetValue('toName', ben?.name || '');
                            tSetValue('toIfsc', ben?.ifscCode || '');
                          }}
                        >
                          <option value="">Select or enter manually</option>
                          {beneficiaries.map((b: any) => (
                            <option key={b._id} value={b.accountNumber}>{b.nickname || b.name} - {b.accountNumber}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Transfer Type</Label>
                        <select className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm" {...tReg('transactionType')}>
                          <option value="neft">NEFT</option>
                          <option value="rtgs">RTGS</option>
                          <option value="imps">IMPS</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                          placeholder="Enter account number"
                          value={tWatch('toAccount') || ''}
                          onChange={(e) => tSetValue('toAccount', e.target.value)}
                          className={cn(tErrors.toAccount && 'border-red-500')}
                        />
                        {tErrors.toAccount && <p className="text-xs text-red-500">{tErrors.toAccount.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>IFSC Code</Label>
                        <Input
                          placeholder="Enter IFSC"
                          value={tWatch('toIfsc') || ''}
                          onChange={(e) => tSetValue('toIfsc', e.target.value)}
                          className={cn(tErrors.toIfsc && 'border-red-500')}
                        />
                        {tErrors.toIfsc && <p className="text-xs text-red-500">{tErrors.toIfsc.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Beneficiary Name</Label>
                        <Input
                          placeholder="Enter name"
                          value={tWatch('toName') || ''}
                          onChange={(e) => tSetValue('toName', e.target.value)}
                          className={cn(tErrors.toName && 'border-red-500')}
                        />
                        {tErrors.toName && <p className="text-xs text-red-500">{tErrors.toName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          className={cn(tErrors.amount && 'border-red-500')}
                          {...tReg('amount')}
                        />
                        {tErrors.amount && <p className="text-xs text-red-500">{tErrors.amount.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="What's this for?"
                        className={cn(tErrors.description && 'border-red-500')}
                        {...tReg('description')}
                      />
                      {tErrors.description && <p className="text-xs text-red-500">{tErrors.description.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={transferMutation.isPending}>
                      {transferMutation.isPending ? 'Processing...' : 'Send Money'} <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><CardTitle>Quick Transfer</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-sbi-500">Recent beneficiaries</p>
                  {beneficiaries.slice(0, 5).map((b: any) => (
                    <button
                      key={b._id}
                      className="w-full text-left rounded-lg border p-3 hover:bg-sbi-50 transition-colors"
                      onClick={() => {
                        tSetValue('toAccount', b.accountNumber);
                        tSetValue('toName', b.name);
                        tSetValue('toIfsc', b.ifscCode);
                        setActiveTab('transfer');
                      }}
                    >
                      <p className="font-medium text-sm">{b.nickname || b.name}</p>
                      <p className="text-xs text-sbi-500">{b.accountNumber}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Saved Beneficiaries</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficiaries.map((b: any) => (
                        <TableRow key={b._id}>
                          <TableCell className="font-medium">{b.nickname || b.name}</TableCell>
                          <TableCell className="font-mono text-xs">{b.accountNumber}</TableCell>
                          <TableCell>{b.bankName}</TableCell>
                          <TableCell><Badge variant={b.isVerified ? 'success' : 'warning'}>{b.isVerified ? 'Verified' : 'Pending'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><CardTitle>Add Beneficiary</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={bHandleSubmit(onAddBeneficiary)} className="space-y-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Full name"
                        className={cn(bErrors.name && 'border-red-500')}
                        {...bReg('name')}
                      />
                      {bErrors.name && <p className="text-xs text-red-500">{bErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="Account number"
                        className={cn(bErrors.accountNumber && 'border-red-500')}
                        {...bReg('accountNumber')}
                      />
                      {bErrors.accountNumber && <p className="text-xs text-red-500">{bErrors.accountNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input
                        placeholder="IFSC code"
                        className={cn(bErrors.ifscCode && 'border-red-500')}
                        {...bReg('ifscCode')}
                      />
                      {bErrors.ifscCode && <p className="text-xs text-red-500">{bErrors.ifscCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="Bank name"
                        className={cn(bErrors.bankName && 'border-red-500')}
                        {...bReg('bankName')}
                      />
                      {bErrors.bankName && <p className="text-xs text-red-500">{bErrors.bankName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Nickname (Optional)</Label>
                      <Input
                        placeholder="e.g., Dad, Friend"
                        {...bReg('nickname')}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={beneficiaryMutation.isPending}>
                      {beneficiaryMutation.isPending ? 'Adding...' : 'Add Beneficiary'} <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn: any, idx: number) => (
                    <TableRow key={txn._id || idx}>
                      <TableCell className="text-xs">{formatDateTime(txn.createdAt)}</TableCell>
                      <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{txn.transactionType}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{txn.fromAccount.slice(-6)}</TableCell>
                      <TableCell className="font-mono text-xs">{txn.toAccount.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(txn.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={txn.status === 'success' ? 'success' : txn.status === 'pending' ? 'warning' : 'destructive'}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
