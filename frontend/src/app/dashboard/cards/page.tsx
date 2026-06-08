'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { accountApi, cardApi } from '@/services/api';
import { formatCurrency, maskCardNumber, maskAccountNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { CreditCard as CreditCardIcon, Plus, Shield, Globe, Wifi, Lock, Unlock, XCircle, Settings } from 'lucide-react';

const cardGradients: Record<string, string> = {
  'debit_visa': 'from-blue-600 via-blue-700 to-blue-900',
  'debit_mastercard': 'from-orange-500 via-red-600 to-red-900',
  'credit_visa': 'from-amber-500 via-amber-700 to-amber-900',
  'credit_mastercard': 'from-violet-600 via-purple-700 to-purple-900',
};

const statusConfig: Record<string, { variant: 'success' | 'secondary' | 'destructive' | 'warning'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  blocked: { variant: 'destructive', label: 'Blocked' },
  expired: { variant: 'secondary', label: 'Expired' },
  cancelled: { variant: 'warning', label: 'Cancelled' },
};

export default function CardsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [showIssueDebit, setShowIssueDebit] = useState(false);
  const [showApplyCredit, setShowApplyCredit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [debitForm, setDebitForm] = useState({ accountId: '', cardNetwork: 'visa' });
  const [creditForm, setCreditForm] = useState({ cardNetwork: 'visa', creditLimit: '', annualIncome: '' });
  const [limitForm, setLimitForm] = useState({ dailyLimit: '', monthlyLimit: '' });

  const { data: cardsRes } = useQuery({ queryKey: ['cards'], queryFn: () => cardApi.getAll() });
  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });

  const cards = cardsRes?.data?.data || [];
  const accounts = accountsRes?.data?.data || [];

  useEffect(() => {
    if (selectedCard) {
      setLimitForm({
        dailyLimit: selectedCard.dailyLimit?.toString() || '',
        monthlyLimit: selectedCard.monthlyLimit?.toString() || '',
      });
    }
  }, [selectedCard]);

  const handleViewDetails = (card: any) => {
    setSelectedCard(card);
    setShowDetails(true);
  };

  const issueDebitMutation = useMutation({
    mutationFn: (data: any) => cardApi.issueDebit(data),
    onSuccess: () => {
      addToast({ title: 'Debit card issued successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowIssueDebit(false);
      setDebitForm({ accountId: '', cardNetwork: 'visa' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to issue debit card', variant: 'error' }),
  });

  const issueCreditMutation = useMutation({
    mutationFn: (data: any) => cardApi.issueCredit(data),
    onSuccess: () => {
      addToast({ title: 'Credit card application submitted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowApplyCredit(false);
      setCreditForm({ cardNetwork: 'visa', creditLimit: '', annualIncome: '' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to apply for credit card', variant: 'error' }),
  });

  const blockMutation = useMutation({
    mutationFn: (id: string) => cardApi.block(id),
    onSuccess: () => {
      addToast({ title: 'Card blocked successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to block card', variant: 'error' }),
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => cardApi.unblock(id),
    onSuccess: () => {
      addToast({ title: 'Card unblocked successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to unblock card', variant: 'error' }),
  });

  const setLimitsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cardApi.setLimits(id, data),
    onSuccess: () => {
      addToast({ title: 'Limits updated successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to update limits', variant: 'error' }),
  });

  const toggleInternationalMutation = useMutation({
    mutationFn: (id: string) => cardApi.toggleInternational(id),
    onSuccess: () => {
      addToast({ title: 'International usage toggled', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to toggle international usage', variant: 'error' }),
  });

  const toggleContactlessMutation = useMutation({
    mutationFn: (id: string) => cardApi.toggleContactless(id),
    onSuccess: () => {
      addToast({ title: 'Contactless payment toggled', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to toggle contactless', variant: 'error' }),
  });

  const setPinMutation = useMutation({
    mutationFn: (id: string) => cardApi.setPin(id),
    onSuccess: () => {
      addToast({ title: 'PIN change request initiated. Check your registered mobile.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to initiate PIN change', variant: 'error' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cardApi.cancel(id),
    onSuccess: () => {
      addToast({ title: 'Card cancelled successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowDetails(false);
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to cancel card', variant: 'error' }),
  });

  const handleIssueDebit = (e: React.FormEvent) => {
    e.preventDefault();
    issueDebitMutation.mutate(debitForm);
  };

  const handleApplyCredit = (e: React.FormEvent) => {
    e.preventDefault();
    issueCreditMutation.mutate({
      ...creditForm,
      creditLimit: parseFloat(creditForm.creditLimit),
    });
  };

  const handleSaveLimits = () => {
    if (!selectedCard) return;
    const data: any = {};
    if (limitForm.dailyLimit) data.dailyLimit = parseFloat(limitForm.dailyLimit);
    if (limitForm.monthlyLimit) data.monthlyLimit = parseFloat(limitForm.monthlyLimit);
    setLimitsMutation.mutate({ id: selectedCard._id, data });
  };

  const getCardGradient = (card: any) =>
    cardGradients[`${card.cardType}_${card.cardNetwork}`] || cardGradients['debit_visa'];

  const getStatusConfig = (status: string) =>
    statusConfig[status] || { variant: 'secondary' as const, label: status };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Cards</h1>
          <p className="text-sbi-500">Manage your debit and credit cards</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showIssueDebit} onOpenChange={setShowIssueDebit}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Issue Debit Card</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Issue Debit Card</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleIssueDebit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Account</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={debitForm.accountId}
                    onChange={(e) => setDebitForm({ ...debitForm, accountId: e.target.value })}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc: any) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountType.toUpperCase()} - {maskAccountNumber(acc.accountNumber)} (₹{acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Card Network</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={debitForm.cardNetwork}
                    onChange={(e) => setDebitForm({ ...debitForm, cardNetwork: e.target.value })}
                  >
                    <option value="visa">VISA</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={issueDebitMutation.isPending}>
                  {issueDebitMutation.isPending ? 'Issuing...' : 'Issue Debit Card'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showApplyCredit} onOpenChange={setShowApplyCredit}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Apply for Credit Card</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Credit Card</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApplyCredit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Network</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                    value={creditForm.cardNetwork}
                    onChange={(e) => setCreditForm({ ...creditForm, cardNetwork: e.target.value })}
                  >
                    <option value="visa">VISA</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Requested Credit Limit (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter desired credit limit"
                    value={creditForm.creditLimit}
                    onChange={(e) => setCreditForm({ ...creditForm, creditLimit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Income (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter your annual income"
                    value={creditForm.annualIncome}
                    onChange={(e) => setCreditForm({ ...creditForm, annualIncome: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={issueCreditMutation.isPending}>
                  {issueCreditMutation.isPending ? 'Applying...' : 'Submit Application'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card: any) => {
          const statusCfg = getStatusConfig(card.status);
          const gradient = getCardGradient(card);
          return (
            <div key={card._id} className="space-y-3">
              <div
                className={`relative rounded-xl p-6 text-white overflow-hidden shadow-lg bg-gradient-to-br ${gradient} cursor-pointer transition-transform hover:scale-[1.02]`}
                onClick={() => handleViewDetails(card)}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-7 rounded bg-yellow-300/40 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-yellow-900">CHIP</span>
                    </div>
                    {card.contactlessEnabled && <Wifi className="h-4 w-4 text-white/70 rotate-90" />}
                  </div>
                  <span className="text-sm font-bold tracking-widest">
                    {card.cardNetwork === 'visa' ? 'VISA' : 'MASTERCARD'}
                  </span>
                </div>

                <p className="text-lg font-mono tracking-widest mb-4 text-white/90">
                  {maskCardNumber(card.cardNumber)}
                </p>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase text-white/60 tracking-wider">Card Holder</p>
                    <p className="font-semibold text-sm">{card.cardHolderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-white/60 tracking-wider">Valid Thru</p>
                    <p className="font-semibold text-sm">{card.expiryDate}</p>
                  </div>
                </div>

                <div className="absolute top-3 right-3 flex gap-1">
                  <Badge variant={card.cardType === 'credit' ? 'default' : 'secondary'} className="text-[10px] bg-white/20 text-white border-0">
                    {card.cardType.toUpperCase()}
                  </Badge>
                  <Badge variant={statusCfg.variant} className="text-[10px]">
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>

              {card.status === 'active' && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => blockMutation.mutate(card._id)} disabled={blockMutation.isPending}>
                    <Lock className="h-3 w-3 mr-1" /> Block
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(card)}>
                    <Settings className="h-3 w-3 mr-1" /> Limits
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleInternationalMutation.mutate(card._id)} disabled={toggleInternationalMutation.isPending}>
                    <Globe className="h-3 w-3 mr-1" /> {card.internationalEnabled ? 'Disable Intl' : 'Enable Intl'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleContactlessMutation.mutate(card._id)} disabled={toggleContactlessMutation.isPending}>
                    <Wifi className="h-3 w-3 mr-1" /> {card.contactlessEnabled ? 'Disable NFC' : 'Enable NFC'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPinMutation.mutate(card._id)} disabled={setPinMutation.isPending}>
                    <Shield className="h-3 w-3 mr-1" /> Set PIN
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this card? This action cannot be undone.')) {
                      cancelMutation.mutate(card._id);
                    }
                  }} disabled={cancelMutation.isPending}>
                    <XCircle className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </div>
              )}
              {card.status === 'blocked' && (
                <Button size="sm" variant="outline" onClick={() => unblockMutation.mutate(card._id)} disabled={unblockMutation.isPending} className="w-full">
                  <Unlock className="h-3 w-3 mr-1" /> Unblock Card
                </Button>
              )}
            </div>
          );
        })}
        {cards.length === 0 && (
          <div className="col-span-full text-center py-16">
            <CreditCardIcon className="h-16 w-16 mx-auto text-sbi-300 mb-4" />
            <h3 className="text-lg font-medium text-sbi-700">No cards yet</h3>
            <p className="text-sbi-500 mt-1">Issue a debit card or apply for a credit card to get started</p>
          </div>
        )}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Card Details</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sbi-500 text-xs">Card Number</Label>
                  <p className="font-mono font-medium">{maskCardNumber(selectedCard.cardNumber)}</p>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">Card Network</Label>
                  <p className="font-medium uppercase">{selectedCard.cardNetwork}</p>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">Card Type</Label>
                  <Badge variant={selectedCard.cardType === 'credit' ? 'default' : 'secondary'}>
                    {selectedCard.cardType.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">Status</Label>
                  <Badge variant={getStatusConfig(selectedCard.status).variant}>
                    {getStatusConfig(selectedCard.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">Card Holder</Label>
                  <p className="font-medium">{selectedCard.cardHolderName}</p>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">Expiry Date</Label>
                  <p className="font-medium">{selectedCard.expiryDate}</p>
                </div>
                <div>
                  <Label className="text-sbi-500 text-xs">CVV</Label>
                  <p className="font-mono">***</p>
                </div>
                {selectedCard.cardType === 'credit' && (
                  <>
                    <div>
                      <Label className="text-sbi-500 text-xs">Credit Limit</Label>
                      <p className="font-medium">{formatCurrency(selectedCard.creditLimit)}</p>
                    </div>
                    <div>
                      <Label className="text-sbi-500 text-xs">Available Credit</Label>
                      <p className="font-medium text-green-600">{formatCurrency(selectedCard.availableCredit)}</p>
                    </div>
                    <div>
                      <Label className="text-sbi-500 text-xs">Outstanding</Label>
                      <p className="font-medium text-orange-600">{formatCurrency(selectedCard.outstandingAmount || 0)}</p>
                    </div>
                  </>
                )}
              </div>

              <hr className="border-sbi-200" />

              <div>
                <h4 className="font-medium text-sbi-900 mb-3">Transaction Limits</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Daily Limit (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Daily limit"
                      value={limitForm.dailyLimit}
                      onChange={(e) => setLimitForm({ ...limitForm, dailyLimit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Limit (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Monthly limit"
                      value={limitForm.monthlyLimit}
                      onChange={(e) => setLimitForm({ ...limitForm, monthlyLimit: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveLimits} disabled={setLimitsMutation.isPending} className="w-full">
                  {setLimitsMutation.isPending ? 'Saving...' : 'Save Limits'}
                </Button>
              </div>

              <hr className="border-sbi-200" />

              <div>
                <h4 className="font-medium text-sbi-900 mb-3">Card Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-sbi-500" />
                      <span className="text-sm">International Transactions</span>
                    </div>
                    <Badge variant={selectedCard.internationalEnabled ? 'success' : 'secondary'}>
                      {selectedCard.internationalEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-sbi-500" />
                      <span className="text-sm">Contactless Payments</span>
                    </div>
                    <Badge variant={selectedCard.contactlessEnabled ? 'success' : 'secondary'}>
                      {selectedCard.contactlessEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-sbi-500" />
                      <span className="text-sm">PIN Set</span>
                    </div>
                    <Badge variant={selectedCard.pinSet ? 'success' : 'warning'}>
                      {selectedCard.pinSet ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedCard.status === 'active' && (
                <>
                  <hr className="border-sbi-200" />
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
                    <div className="flex gap-3">
                      <Button variant="destructive" size="sm" onClick={() => blockMutation.mutate(selectedCard._id)} disabled={blockMutation.isPending}>
                        <Lock className="h-3 w-3 mr-1" /> Block Card
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this card? This action cannot be undone.')) {
                          cancelMutation.mutate(selectedCard._id);
                        }
                      }} disabled={cancelMutation.isPending}>
                        <XCircle className="h-3 w-3 mr-1" /> Cancel Card
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
