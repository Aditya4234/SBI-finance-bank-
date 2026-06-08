'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { beneficiaryApi } from '@/services/api';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BeneficiariesPage() {
  const { data: benRes } = useQuery({ queryKey: ['beneficiaries'], queryFn: () => beneficiaryApi.getAll() });
  const beneficiaries = benRes?.data?.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Beneficiaries</h1>
          <p className="text-sbi-500">Manage your saved beneficiaries for quick transfers</p>
        </div>
        <Link href="/transfer"><Button variant="outline" className="w-full sm:w-auto">Add New <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Saved Beneficiaries</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>IFSC Code</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transfer Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((b: any) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.nickname || '-'}</TableCell>
                  <TableCell className="font-mono">{b.accountNumber}</TableCell>
                  <TableCell>{b.ifscCode}</TableCell>
                  <TableCell>{b.bankName}</TableCell>
                  <TableCell><Badge variant={b.isVerified ? 'success' : 'warning'}>{b.isVerified ? 'Verified' : 'Pending'}</Badge></TableCell>
                  <TableCell>₹{b.transferLimit?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
