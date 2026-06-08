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
import { accountApi, loanApi } from '@/services/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { PiggyBank, Calculator, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const loanSchema = z.object({
  loanType: z.string().min(1, 'Please select a loan type'),
  amount: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Loan amount is required' })
      .positive('Amount must be positive')
      .min(1000, 'Minimum loan amount is ₹1,000')
      .max(10000000, 'Maximum loan amount is ₹1,00,00,000')
  ),
  tenure: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number({ required_error: 'Tenure is required' })
      .int('Tenure must be a whole number')
      .positive('Tenure must be positive')
      .min(1, 'Minimum tenure is 1 month')
      .max(360, 'Maximum tenure is 360 months')
  ),
  accountNumber: z.string().min(1, 'Please select an account for disbursement'),
  purpose: z.string().optional(),
});

type LoanForm = z.infer<typeof loanSchema>;

export default function LoansPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showApply, setShowApply] = useState(false);
  const [emiResult, setEmiResult] = useState<any>(null);
  const [emiForm, setEmiForm] = useState({ amount: '', rate: '', tenure: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanType: 'personal',
      amount: undefined as any,
      tenure: undefined as any,
      accountNumber: '',
      purpose: '',
    },
  });

  const { data: loansRes } = useQuery({ queryKey: ['loans'], queryFn: () => loanApi.getAll() });
  const { data: accountsRes } = useQuery<any>({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });

  const loans = loansRes?.data?.data || [];
  const accounts = accountsRes?.data?.data || [];

  const applyMutation = useMutation({
    mutationFn: (data: any) => loanApi.apply(data),
    onSuccess: () => {
      addToast({ title: 'Loan application submitted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setShowApply(false);
      reset();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Application failed', variant: 'error' }),
  });

  const calculateEmi = async () => {
    try {
      const res = await loanApi.calculateEmi({ amount: parseFloat(emiForm.amount), rate: parseFloat(emiForm.rate), tenure: parseFloat(emiForm.tenure) });
      setEmiResult(res.data.data);
    } catch {
      addToast({ title: 'Calculation failed', variant: 'error' });
    }
  };

  const onSubmit = (data: LoanForm) => {
    applyMutation.mutate(data);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Loans</h1>
          <p className="text-sbi-500">Apply for loans, check status, and calculate EMI</p>
        </div>
        <Button onClick={() => setShowApply(!showApply)} className="w-full sm:w-auto">
          <PiggyBank className="mr-2 h-4 w-4" /> {showApply ? 'View Loans' : 'Apply for Loan'}
        </Button>
      </div>

      {showApply ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Apply for Loan</CardTitle><CardDescription>Choose from various loan products</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Loan Type</Label>
                    <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', errors.loanType && 'border-red-500')} {...register('loanType')}>
                      <option value="personal">Personal Loan (10.5%)</option>
                      <option value="home">Home Loan (8.5%)</option>
                      <option value="car">Car Loan (9.0%)</option>
                      <option value="education">Education Loan (7.5%)</option>
                      <option value="business">Business Loan (12.0%)</option>
                      <option value="gold">Gold Loan (7.0%)</option>
                    </select>
                    {errors.loanType && <p className="text-xs text-red-500">{errors.loanType.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loan Amount (₹)</Label>
                      <Input type="number" placeholder="Enter amount" className={cn(errors.amount && 'border-red-500')} {...register('amount')} />
                      {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Tenure (Months)</Label>
                      <Input type="number" placeholder="Enter tenure" className={cn(errors.tenure && 'border-red-500')} {...register('tenure')} />
                      {errors.tenure && <p className="text-xs text-red-500">{errors.tenure.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Account for Disbursement</Label>
                    <select className={cn('flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm', errors.accountNumber && 'border-red-500')} {...register('accountNumber')}>
                      <option value="">Select account</option>
                      {accounts.map((acc: any) => (
                        <option key={acc._id} value={acc.accountNumber}>{acc.accountType.toUpperCase()} - {acc.accountNumber}</option>
                      ))}
                    </select>
                    {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose</Label>
                    <Input placeholder="Purpose of loan" {...register('purpose')} />
                  </div>
                  <Button type="submit" className="w-full" disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? 'Submitting...' : 'Submit Application'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>EMI Calculator</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" placeholder="Loan amount" value={emiForm.amount} onChange={(e) => setEmiForm({ ...emiForm, amount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Rate (% p.a.)</Label>
                  <Input type="number" step="0.1" placeholder="Interest rate" value={emiForm.rate} onChange={(e) => setEmiForm({ ...emiForm, rate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tenure (Months)</Label>
                  <Input type="number" placeholder="Tenure" value={emiForm.tenure} onChange={(e) => setEmiForm({ ...emiForm, tenure: e.target.value })} />
                </div>
                <Button onClick={calculateEmi} className="w-full" variant="secondary">
                  <Calculator className="mr-2 h-4 w-4" /> Calculate EMI
                </Button>
                {emiResult && (
                  <div className="rounded-lg bg-sbi-50 p-4 space-y-2 mt-2">
                    <div className="flex justify-between text-sm"><span>Monthly EMI</span><span className="font-bold">{formatCurrency(emiResult.emi)}</span></div>
                    <div className="flex justify-between text-sm"><span>Total Payable</span><span className="font-bold">{formatCurrency(emiResult.totalPayable)}</span></div>
                    <div className="flex justify-between text-sm"><span>Total Interest</span><span className="font-bold text-red-600">{formatCurrency(emiResult.totalInterest)}</span></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader><CardTitle>My Loans</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Monthly EMI</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan: any) => (
                  <TableRow key={loan._id}>
                    <TableCell className="capitalize font-medium">{loan.loanType}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.monthlyEmi)}</TableCell>
                    <TableCell>{loan.tenure} months</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>
                      <Badge variant={loan.status === 'approved' ? 'success' : loan.status === 'rejected' ? 'destructive' : loan.status === 'disbursed' ? 'default' : 'warning'}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(loan.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {loans.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sbi-500 py-8">No loans applied yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
