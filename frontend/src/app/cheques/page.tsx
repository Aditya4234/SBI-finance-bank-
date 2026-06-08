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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { accountApi, chequeApi } from '@/services/api';
import { formatDate, formatCurrency, maskAccountNumber, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import { FileText, BookOpen, Search, Ban, Plus, ChevronDown, ChevronRight } from 'lucide-react';

const chequeStatusConfig: Record<string, { variant: 'success' | 'secondary' | 'destructive' | 'warning'; label: string }> = {
  unused: { variant: 'secondary', label: 'Unused' },
  issued: { variant: 'warning', label: 'Issued' },
  cleared: { variant: 'success', label: 'Cleared' },
  stopped: { variant: 'destructive', label: 'Stopped' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
};

const bookStatusConfig: Record<string, { variant: 'success' | 'secondary' | 'destructive' | 'warning'; label: string }> = {
  REQUESTED: { variant: 'warning', label: 'Requested' },
  APPROVED: { variant: 'secondary', label: 'Approved' },
  DISPATCHED: { variant: 'secondary', label: 'Dispatched' },
  DELIVERED: { variant: 'success', label: 'Delivered' },
};

export default function ChequesPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('books');
  const [showRequestBook, setShowRequestBook] = useState(false);
  const [expandBook, setExpandBook] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({ accountId: '', leafCount: 25, branchName: 'Main Branch' });
  const [statusForm, setStatusForm] = useState({ leafNumber: '', accountNumber: '' });
  const [stopForm, setStopForm] = useState({ accountNumber: '', leafNumber: '', reason: '' });

  const { data: accountsRes } = useQuery({ queryKey: ['accounts'], queryFn: () => accountApi.getAll() });
  const { data: chequesRes } = useQuery({ queryKey: ['cheques'], queryFn: () => chequeApi.getAll() });

  const accounts = accountsRes?.data?.data || [];
  const cheques = chequesRes?.data?.data || [];

  const requestBookMutation = useMutation({
    mutationFn: (data: any) => chequeApi.requestBook(data),
    onSuccess: () => {
      addToast({ title: 'Cheque book requested successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      setShowRequestBook(false);
      setRequestForm({ accountId: '', leafCount: 25, branchName: 'Main Branch' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to request cheque book', variant: 'error' }),
  });

  const stopChequeMutation = useMutation({
    mutationFn: (data: any) => chequeApi.stopByNumber(data),
    onSuccess: () => {
      addToast({ title: 'Cheque stop request submitted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      setStopForm({ accountNumber: '', leafNumber: '', reason: '' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to stop cheque', variant: 'error' }),
  });

  const getStatusMutation = useMutation({
    mutationFn: () => chequeApi.getStatus(parseInt(statusForm.leafNumber), statusForm.accountNumber),
    onSuccess: (res: any) => {
      const data = res?.data?.data || res?.data;
      addToast({ title: `Cheque status: ${data?.status || 'Unknown'}`, variant: 'success', description: data?.reason || '' });
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Cheque not found', variant: 'error' }),
  });

  const handleRequestBook = (e: React.FormEvent) => {
    e.preventDefault();
    requestBookMutation.mutate(requestForm);
  };

  const handleStopCheque = (e: React.FormEvent) => {
    e.preventDefault();
    stopChequeMutation.mutate({
      accountNumber: stopForm.accountNumber,
      leafNumber: parseInt(stopForm.leafNumber),
      reason: stopForm.reason || undefined,
    });
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    getStatusMutation.mutate();
  };

  const getBookStatusConfig = (status: string) => bookStatusConfig[status] || { variant: 'secondary' as const, label: status };

  const getChequeStatusConfig = (status: string) => chequeStatusConfig[status] || { variant: 'secondary' as const, label: status };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Cheque Management</h1>
          <p className="text-sbi-500">Request cheque books, stop cheques, and check status</p>
        </div>
        <Dialog open={showRequestBook} onOpenChange={setShowRequestBook}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Request Cheque Book</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Request New Cheque Book</DialogTitle></DialogHeader>
            <form onSubmit={handleRequestBook} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Account</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                  value={requestForm.accountId}
                  onChange={(e) => setRequestForm({ ...requestForm, accountId: e.target.value })}
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((acc: any) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType.toUpperCase()} - {maskAccountNumber(acc.accountNumber)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Number of Leaves</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-sbi-200 bg-white px-3 py-1 text-sm shadow-sm"
                  value={requestForm.leafCount}
                  onChange={(e) => setRequestForm({ ...requestForm, leafCount: parseInt(e.target.value) })}
                >
                  <option value={25}>25 Leaves</option>
                  <option value={50}>50 Leaves</option>
                  <option value={100}>100 Leaves</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  value={requestForm.branchName}
                  onChange={(e) => setRequestForm({ ...requestForm, branchName: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={requestBookMutation.isPending}>
                {requestBookMutation.isPending ? 'Requesting...' : 'Submit Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="books"><BookOpen className="mr-2 h-4 w-4" /> Cheque Books</TabsTrigger>
          <TabsTrigger value="status"><Search className="mr-2 h-4 w-4" /> Check Status</TabsTrigger>
          <TabsTrigger value="stop"><Ban className="mr-2 h-4 w-4" /> Stop Cheque</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Cheque Books</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Book Number</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Leaf Range</TableHead>
                    <TableHead>Leaves</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cheques.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-sbi-400 py-8">No cheque books requested yet</TableCell></TableRow>
                  )}
                  {cheques.map((book: any) => (
                    <React.Fragment key={book._id}>
                      <TableRow className="cursor-pointer hover:bg-sbi-50" onClick={() => setExpandBook(expandBook === book._id ? null : book._id)}>
                        <TableCell>
                          {expandBook === book._id ? <ChevronDown className="h-4 w-4 text-sbi-400" /> : <ChevronRight className="h-4 w-4 text-sbi-400" />}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{book.bookNumber || book._id.slice(-8).toUpperCase()}</TableCell>
                        <TableCell className="font-mono text-xs">{maskAccountNumber(book.accountNumber || book.account?.accountNumber || '')}</TableCell>
                        <TableCell className="font-mono text-xs">{book.leafStart || '001'} - {book.leafEnd || book.leafCount}</TableCell>
                        <TableCell>{book.leafCount || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getBookStatusConfig(book.status).variant}>{getBookStatusConfig(book.status).label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(book.createdAt)}</TableCell>
                      </TableRow>
                      {expandBook === book._id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-sbi-50/50 p-4">
                            <div>
                              <h4 className="text-sm font-medium text-sbi-900 mb-2">Individual Leaf Status</h4>
                              {book.leaves && book.leaves.length > 0 ? (
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                                  {book.leaves.map((leaf: any, idx: number) => {
                                    const leafCfg = getChequeStatusConfig(leaf.status);
                                    return (
                                      <div
                                        key={leaf.leafNumber || idx}
                                        className="text-center p-1 rounded text-[10px] border"
                                        style={{ borderColor: leafCfg.variant === 'success' ? '#22c55e' : leafCfg.variant === 'destructive' ? '#ef4444' : leafCfg.variant === 'warning' ? '#f59e0b' : '#e2e8f0' }}
                                      >
                                        <p className="font-mono font-medium">{String(leaf.leafNumber || (idx + 1)).padStart(3, '0')}</p>
                                        <Badge variant={leafCfg.variant} className="text-[8px] px-1 py-0">{leafCfg.label}</Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-sbi-400">Leaf details not available</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Cheque Status Check</CardTitle><CardDescription>Check the current status of a specific cheque leaf</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleCheckStatus} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    value={statusForm.accountNumber}
                    onChange={(e) => setStatusForm({ ...statusForm, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cheque Leaf Number</Label>
                  <Input
                    type="number"
                    placeholder="Enter leaf number"
                    value={statusForm.leafNumber}
                    onChange={(e) => setStatusForm({ ...statusForm, leafNumber: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={getStatusMutation.isPending}>
                  {getStatusMutation.isPending ? 'Checking...' : 'Check Status'} <Search className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stop" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Stop Cheque Payment</CardTitle><CardDescription>Request to stop payment on a specific cheque</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleStopCheque} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    value={stopForm.accountNumber}
                    onChange={(e) => setStopForm({ ...stopForm, accountNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cheque Leaf Number</Label>
                  <Input
                    type="number"
                    placeholder="Enter leaf number"
                    value={stopForm.leafNumber}
                    onChange={(e) => setStopForm({ ...stopForm, leafNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason (Optional)</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-sbi-200 bg-white px-3 py-2 text-sm shadow-sm resize-y"
                    placeholder="Reason for stopping this cheque"
                    value={stopForm.reason}
                    onChange={(e) => setStopForm({ ...stopForm, reason: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={stopChequeMutation.isPending}>
                  {stopChequeMutation.isPending ? 'Processing...' : 'Stop Cheque'} <Ban className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
