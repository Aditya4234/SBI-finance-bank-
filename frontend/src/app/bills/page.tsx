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
import { accountApi, billPaymentApi } from '@/services/api';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { Zap, Phone, Clock, Calendar } from 'lucide-react';

const billTypes = [
  'Electricity', 'Water', 'Gas', 'Broadband', 'Credit Card', 'Insurance', 'DTH', 'Landline', 'Loan Repayment', 'Municipal Tax',
];

const payBillSchema = z.object({
  fromAccount: z.string().min(1, 'Please select an account'),
  billType: z.string().min(1, 'Please select bill type'),
  billerName: z.string().min(1, 'Biller name is required'),
  consumerNumber: z.string().min(1, 'Consumer number is required'),
  amount: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0').max(10000000)
  ),
  reference: z.string().optional(),
});

const rechargeSchema = z.object({
  fromAccount: z.string().min(1, 'Please select an account'),
  type: z.string().min(1, 'Please select type'),
  operator: z.string().min(1, 'Operator/Account is required'),
  amount: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0').max(50000)
  ),
});

type PayBillForm = z.infer<typeof payBillSchema>;
type RechargeForm = z.infer<typeof rechargeSchema>;

export default function BillsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pay-bills');

  const payForm = useForm<PayBillForm>({
    resolver: zodResolver(payBillSchema),
    defaultValues: { fromAccount: '', billType: '', billerName: '', consumerNumber: '', amount: undefined as any, reference: '' },
  });

  const rechargeForm = useForm<RechargeForm>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: { fromAccount: '', type: 'Mobile', operator: '', amount: undefined as any },
  });

  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });
  const { data: historyRes } = useQuery({ queryKey: ['bill-history'], queryFn: () => billPaymentApi.getHistory() });
  const { data: pendingRes } = useQuery({ queryKey: ['bill-pending'], queryFn: () => billPaymentApi.getPending() });

  const accounts = accountsRes?.data?.data || [];
  const history = historyRes?.data?.data?.bills || [];
  const pendingBills = pendingRes?.data?.data || [];

  const payBillMutation = useMutation({
    mutationFn: (data: any) => billPaymentApi.payBill(data),
    onSuccess: () => {
      addToast({ title: 'Bill paid successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bill-history'] });
      queryClient.invalidateQueries({ queryKey: ['bill-pending'] });
      payForm.reset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Payment failed', variant: 'error' }),
  });

  const rechargeMutation = useMutation({
    mutationFn: (data: any) => billPaymentApi.recharge(data),
    onSuccess: () => {
      addToast({ title: 'Recharge successful', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bill-history'] });
      rechargeForm.reset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Recharge failed', variant: 'error' }),
  });

  const onPayBill = (data: PayBillForm) => payBillMutation.mutate(data);
  const onRecharge = (data: RechargeForm) => rechargeMutation.mutate(data);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-sbi-900">Bills & Recharges</h1>
        <p className="text-sbi-500">Pay bills, recharge your prepaid services, and view history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="pay-bills" className="whitespace-nowrap"><Zap className="mr-2 h-4 w-4" /> Pay Bills</TabsTrigger>
          <TabsTrigger value="recharge" className="whitespace-nowrap"><Phone className="mr-2 h-4 w-4" /> Recharge</TabsTrigger>
          <TabsTrigger value="history" className="whitespace-nowrap"><Clock className="mr-2 h-4 w-4" /> History</TabsTrigger>
          <TabsTrigger value="scheduled" className="whitespace-nowrap"><Calendar className="mr-2 h-4 w-4" /> Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="pay-bills" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Pay a Bill</CardTitle><CardDescription>Electricity, Water, Gas, Broadband, and more</CardDescription></CardHeader>
                <CardContent>
                  <form onSubmit={payForm.handleSubmit(onPayBill)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>From Account</Label>
                      <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', payForm.formState.errors.fromAccount && 'border-red-500')} {...payForm.register('fromAccount')}>
                        <option value="">Select account</option>
                        {accounts.map((acc: any) => (
                          <option key={acc._id} value={acc.accountNumber}>
                            {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      {payForm.formState.errors.fromAccount && <p className="text-xs text-red-500">{payForm.formState.errors.fromAccount.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bill Type</Label>
                        <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', payForm.formState.errors.billType && 'border-red-500')} {...payForm.register('billType')}>
                          <option value="">Select type</option>
                          {billTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                        {payForm.formState.errors.billType && <p className="text-xs text-red-500">{payForm.formState.errors.billType.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Biller Name</Label>
                        <Input placeholder="Biller name" className={cn(payForm.formState.errors.billerName && 'border-red-500')} {...payForm.register('billerName')} />
                        {payForm.formState.errors.billerName && <p className="text-xs text-red-500">{payForm.formState.errors.billerName.message}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Consumer Number / Account</Label>
                        <Input placeholder="Consumer number" className={cn(payForm.formState.errors.consumerNumber && 'border-red-500')} {...payForm.register('consumerNumber')} />
                        {payForm.formState.errors.consumerNumber && <p className="text-xs text-red-500">{payForm.formState.errors.consumerNumber.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input type="number" placeholder="Enter amount" className={cn(payForm.formState.errors.amount && 'border-red-500')} {...payForm.register('amount')} />
                        {payForm.formState.errors.amount && <p className="text-xs text-red-500">{payForm.formState.errors.amount.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Reference (Optional)</Label>
                      <Input placeholder="Reference note" {...payForm.register('reference')} />
                    </div>
                    <Button type="submit" className="w-full" disabled={payBillMutation.isPending}>
                      {payBillMutation.isPending ? 'Processing...' : 'Pay Bill'} <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader><CardTitle>Quick Pay</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-sbi-500">Common billers</p>
                  {['Electricity', 'Water', 'Broadband', 'Credit Card', 'Insurance'].map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      className="w-full text-left rounded-lg border p-3 hover:bg-sbi-50 transition-colors text-sm"
                      onClick={() => {
                        payForm.setValue('billType', bt);
                        setActiveTab('pay-bills');
                      }}
                    >
                      {bt}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recharge" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Recharge</CardTitle><CardDescription>Mobile, DTH, FASTag recharges</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={rechargeForm.handleSubmit(onRecharge)} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', rechargeForm.formState.errors.fromAccount && 'border-red-500')} {...rechargeForm.register('fromAccount')}>
                    <option value="">Select account</option>
                    {accounts.map((acc: any) => (
                      <option key={acc._id} value={acc.accountNumber}>
                        {acc.accountType.toUpperCase()} - {acc.accountNumber} (₹{acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {rechargeForm.formState.errors.fromAccount && <p className="text-xs text-red-500">{rechargeForm.formState.errors.fromAccount.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', rechargeForm.formState.errors.type && 'border-red-500')} {...rechargeForm.register('type')}>
                      <option value="Mobile">Mobile</option>
                      <option value="DTH">DTH</option>
                      <option value="FASTag">FASTag</option>
                    </select>
                    {rechargeForm.formState.errors.type && <p className="text-xs text-red-500">{rechargeForm.formState.errors.type.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number / Account</Label>
                    <Input placeholder="Mobile number" className={cn(rechargeForm.formState.errors.operator && 'border-red-500')} {...rechargeForm.register('operator')} />
                    {rechargeForm.formState.errors.operator && <p className="text-xs text-red-500">{rechargeForm.formState.errors.operator.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" placeholder="Enter amount" className={cn(rechargeForm.formState.errors.amount && 'border-red-500')} {...rechargeForm.register('amount')} />
                  {rechargeForm.formState.errors.amount && <p className="text-xs text-red-500">{rechargeForm.formState.errors.amount.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={rechargeMutation.isPending}>
                  {rechargeMutation.isPending ? 'Processing...' : 'Recharge'} <Phone className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Bill Payment History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Biller/Operator</TableHead>
                    <TableHead>Consumer No.</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-sbi-400 py-8">No bill payments yet</TableCell></TableRow>
                  )}
                  {history.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="text-xs">{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.billType || item.type}</Badge></TableCell>
                      <TableCell className="font-medium">{item.billerName || item.operator}</TableCell>
                      <TableCell className="font-mono text-xs">{item.consumerNumber || item.operator}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'success' ? 'success' : item.status === 'pending' ? 'warning' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Scheduled Payments</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBills.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-sbi-400 py-8">No scheduled payments</TableCell></TableRow>
                  )}
                  {pendingBills.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.billerName || item.operator}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{item.billType || item.type}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-xs">{item.scheduledDate ? formatDateTime(item.scheduledDate) : '-'}</TableCell>
                      <TableCell className="text-xs capitalize">{item.frequency || 'One-time'}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'active' ? 'success' : 'warning'}>
                          {item.status === 'active' ? 'Scheduled' : 'Pending'}
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
