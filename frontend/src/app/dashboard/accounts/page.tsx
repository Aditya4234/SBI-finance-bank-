'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { accountApi } from '@/services/api';
import { formatCurrency, maskAccountNumber, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { Wallet, Plus, Eye, EyeOff, Copy, XCircle } from 'lucide-react';

const openAccountSchema = z.object({
  accountType: z.string().min(1, 'Please select an account type'),
  branchName: z.string().min(1, 'Branch name is required'),
  initialDeposit: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: 'Must be a number' }).positive('Initial deposit must be positive').optional()
  ),
  nomineeName: z.string().optional(),
  nomineeRelation: z.string().optional(),
});

type OpenAccountForm = z.infer<typeof openAccountSchema>;

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closingAccount, setClosingAccount] = useState<any>(null);
  const [closeReason, setCloseReason] = useState('');
  const [visibleBalances, setVisibleBalances] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpenAccountForm>({
    resolver: zodResolver(openAccountSchema),
    defaultValues: {
      accountType: 'savings',
      branchName: 'Main Branch',
      initialDeposit: undefined as any,
      nomineeName: '',
      nomineeRelation: '',
    },
  });

  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });
  const accounts = accountsRes?.data?.data || [];

  const openAccountMutation = useMutation({
    mutationFn: (data: any) => accountApi.open(data),
    onSuccess: () => {
      addToast({ title: 'Account opened successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowOpenForm(false);
      reset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to open account', variant: 'error' }),
  });

  const closeAccountMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => accountApi.closeAccount(id, reason),
    onSuccess: () => {
      addToast({ title: 'Account closed successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCloseDialog(false);
      setClosingAccount(null);
      setCloseReason('');
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to close account', variant: 'error' }),
  });

  const onSubmit = (data: OpenAccountForm) => {
    openAccountMutation.mutate({ ...data, initialDeposit: data.initialDeposit || 0 });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: 'Copied to clipboard', variant: 'success' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">My Accounts</h1>
          <p className="text-sbi-500">Manage your savings, current, and deposit accounts</p>
        </div>
        <Dialog open={showOpenForm} onOpenChange={setShowOpenForm}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Open Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Open New Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', errors.accountType && 'border-red-500')} {...register('accountType')}>
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="salary">Salary Account</option>
                  <option value="fixed_deposit">Fixed Deposit</option>
                  <option value="recurring_deposit">Recurring Deposit</option>
                </select>
                {errors.accountType && <p className="text-xs text-red-500">{errors.accountType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input className={cn(errors.branchName && 'border-red-500')} {...register('branchName')} />
                {errors.branchName && <p className="text-xs text-red-500">{errors.branchName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Initial Deposit (₹)</Label>
                <Input type="number" placeholder="0" className={cn(errors.initialDeposit && 'border-red-500')} {...register('initialDeposit')} />
                {errors.initialDeposit && <p className="text-xs text-red-500">{errors.initialDeposit.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nominee Name</Label>
                  <Input placeholder="Nominee name" {...register('nomineeName')} />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Input placeholder="Relation" {...register('nomineeRelation')} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={openAccountMutation.isPending}>
                {openAccountMutation.isPending ? 'Opening...' : 'Open Account'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account: any, index: number) => (
          <Card key={account._id || index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-5 w-5 text-sbi-600" />
                    <h3 className="font-semibold capitalize text-sbi-900">{account.accountType.replace('_', ' ')} Account</h3>
                  </div>
                  <Badge variant={account.status === 'active' ? 'success' : 'secondary'}>{account.status}</Badge>
                </div>
                <button onClick={() => setVisibleBalances({ ...visibleBalances, [account._id]: !visibleBalances[account._id] })}>
                  {visibleBalances[account._id] ? <EyeOff className="h-4 w-4 text-sbi-400" /> : <Eye className="h-4 w-4 text-sbi-400" />}
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-sbi-500">Available Balance</p>
                <p className="text-2xl font-bold text-sbi-900">
                  {visibleBalances[account._id] ? formatCurrency(account.balance) : '\u2022\u2022\u2022\u2022\u2022\u2022'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-sbi-500">Account No.</p>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium">{maskAccountNumber(account.accountNumber)}</span>
                    <button onClick={() => copyToClipboard(account.accountNumber)}><Copy className="h-3 w-3 text-sbi-400 hover:text-sbi-600" /></button>
                  </div>
                </div>
                <div>
                  <p className="text-sbi-500">IFSC</p>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{account.ifscCode}</span>
                    <button onClick={() => copyToClipboard(account.ifscCode)}><Copy className="h-3 w-3 text-sbi-400 hover:text-sbi-600" /></button>
                  </div>
                </div>
                <div>
                  <p className="text-sbi-500">Branch</p>
                  <p className="font-medium">{account.branchName}</p>
                </div>
                <div>
                  <p className="text-sbi-500">UPI</p>
                  <Badge variant={account.upiEnabled ? 'success' : 'secondary'} className="text-[10px]">
                    {account.upiEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
            {account.status !== 'closed' && (
              <div className="px-6 pb-4">
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    setClosingAccount(account);
                    setCloseReason('');
                    setShowCloseDialog(true);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Close Account
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Close Account</DialogTitle>
          </DialogHeader>
          {closingAccount && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <p className="font-medium mb-1">Important</p>
                <p>Before closing this account, please ensure all funds have been transferred out. Any remaining balance will be lost.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-sbi-500">Account Type</p>
                  <p className="font-medium capitalize">{closingAccount.accountType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sbi-500">Account Number</p>
                  <p className="font-mono font-medium">{maskAccountNumber(closingAccount.accountNumber)}</p>
                </div>
                <div>
                  <p className="text-sbi-500">Current Balance</p>
                  <p className="font-medium text-red-600">{formatCurrency(closingAccount.balance)}</p>
                </div>
                <div>
                  <p className="text-sbi-500">Status</p>
                  <Badge variant="secondary" className="text-[10px]">{closingAccount.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Closing (Optional)</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-sbi-200 bg-white px-3 py-2 text-sm shadow-sm resize-y"
                  placeholder="Please provide a reason for closing this account"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCloseDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={closeAccountMutation.isPending}
                  onClick={() => closeAccountMutation.mutate({ id: closingAccount._id, reason: closeReason || undefined })}
                >
                  {closeAccountMutation.isPending ? 'Closing...' : 'Confirm Close'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
