'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppSelector } from '@/store/hooks';
import { kycApi, profileApi } from '@/services/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import {
  Fingerprint, CreditCard, Globe, Car, Vote,
  ShieldCheck, Upload, Eye, AlertTriangle, CheckCircle2, RefreshCw, XCircle, Clock, Info
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card', icon: Fingerprint, description: '12-digit unique identification number' },
  { key: 'pan', label: 'PAN Card', icon: CreditCard, description: '10-digit alphanumeric PAN number' },
  { key: 'passport', label: 'Passport', icon: Globe, description: 'Valid passport with personal details' },
  { key: 'driving_license', label: 'Driving License', icon: Car, description: 'Valid driving license details' },
  { key: 'voter_id', label: 'Voter ID', icon: Vote, description: 'EPIC card with voter information' },
] as const;

export default function KycPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; docType: string }>({ open: false, docType: '' });
  const [uploadForm, setUploadForm] = useState({ documentNumber: '', frontImage: '', backImage: '', selfieImage: '' });
  const [viewDoc, setViewDoc] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });
  const profileData = profileRes?.data?.data || user;

  const { data: kycRes, isLoading, refetch } = useQuery({
    queryKey: ['kyc-documents'],
    queryFn: () => kycApi.getMyDocuments(),
  });
  const kycDocuments: any[] = kycRes?.data?.data || [];

  const uploadMutation = useMutation({
    mutationFn: (data: any) => kycApi.upload(data),
    onSuccess: () => {
      addToast({ title: 'Document uploaded successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      closeUploadDialog();
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Upload failed', variant: 'error' }),
  });

  const getDocumentForType = (docType: string) => kycDocuments.find((d: any) => d.kycType === docType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default: return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const openUpload = (docType: string) => {
    setUploadForm({ documentNumber: '', frontImage: '', backImage: '', selfieImage: '' });
    setUploadDialog({ open: true, docType });
  };

  const closeUploadDialog = () => {
    setUploadDialog({ open: false, docType: '' });
    setUploadForm({ documentNumber: '', frontImage: '', backImage: '', selfieImage: '' });
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.documentNumber.trim() || !uploadForm.frontImage.trim()) {
      addToast({ title: 'Document number and front image are required', variant: 'error' });
      return;
    }
    uploadMutation.mutate({ ...uploadForm, kycType: uploadDialog.docType });
  };

  if (!mounted) return null;

  const isCompleted = profileData?.isKycCompleted;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-sbi-900">KYC Documents</h1>
        <p className="text-sbi-500">Upload and manage your KYC documents</p>
      </div>

      <Card className={cn('border-l-4', isCompleted ? 'border-l-green-500' : 'border-l-amber-500')}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn('rounded-full p-2', isCompleted ? 'bg-green-100' : 'bg-amber-100')}>
              {isCompleted
                ? <ShieldCheck className="h-6 w-6 text-green-600" />
                : <AlertTriangle className="h-6 w-6 text-amber-600" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-sbi-900">KYC Status</h2>
                <Badge variant={isCompleted ? 'success' : 'warning'} className="text-xs">
                  {isCompleted ? 'Completed' : 'Pending'}
                </Badge>
              </div>
              {isCompleted ? (
                <p className="text-sm text-green-700 mt-1">
                  Your KYC verification is complete. All submitted documents have been verified.
                </p>
              ) : (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-amber-700">
                    Your KYC verification is pending. Please upload at least 2 valid documents to complete verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-sbi-900 mb-4">Uploaded Documents</h2>
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-48 rounded bg-sbi-100 mx-auto" />
                <div className="h-4 w-32 rounded bg-sbi-100 mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENT_TYPES.map(({ key, label, icon: Icon, description }) => {
            const doc = getDocumentForType(key);
            return (
              <Card key={key} className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-lg bg-sbi-50 p-2">
                      <Icon className="h-5 w-5 text-sbi-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sbi-900 text-sm">{label}</h3>
                      <p className="text-xs text-sbi-500 truncate">{description}</p>
                    </div>
                    {doc && (
                      <div className="shrink-0">
                        {getStatusBadge(doc.status)}
                      </div>
                    )}
                  </div>
                  {doc?.status === 'rejected' && doc?.remarks && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-2 mb-3">
                      <p className="text-xs text-red-700">
                        <span className="font-medium">Rejected: </span>{doc.remarks}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {doc ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewDoc(doc)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        {doc.status === 'rejected' && (
                          <Button size="sm" className="flex-1" onClick={() => openUpload(key)}>
                            <Upload className="h-3.5 w-3.5 mr-1" /> Re-upload
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" className="w-full" onClick={() => openUpload(key)}>
                        <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">KYC Requirements</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>At least 2 valid documents required for KYC completion</li>
            <li>Documents must be valid and not expired</li>
            <li>Upload clear, legible images of your documents</li>
            <li>KYC verification typically takes 1-2 business days</li>
          </ul>
        </div>
      </div>

      <Dialog open={uploadDialog.open} onOpenChange={(open) => { if (!open) closeUploadDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Upload {uploadDialog.docType?.replace('_', ' ')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Document Number</Label>
              <Input
                placeholder="Enter document number"
                value={uploadForm.documentNumber}
                onChange={(e) => setUploadForm({ ...uploadForm, documentNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Front Image URL</Label>
              <Input
                placeholder="Enter image URL for front side"
                value={uploadForm.frontImage}
                onChange={(e) => setUploadForm({ ...uploadForm, frontImage: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Back Image URL <span className="text-sbi-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="Enter image URL for back side"
                value={uploadForm.backImage}
                onChange={(e) => setUploadForm({ ...uploadForm, backImage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Selfie Image URL <span className="text-sbi-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="Enter image URL for selfie"
                value={uploadForm.selfieImage}
                onChange={(e) => setUploadForm({ ...uploadForm, selfieImage: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeUploadDialog}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Submit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) setViewDoc(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{viewDoc?.kycType?.replace('_', ' ')} Details</DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-sbi-500">Document Number</p>
                  <p className="font-medium">{viewDoc.documentNumber}</p>
                </div>
                <div>
                  <p className="text-sbi-500">Status</p>
                  <div className="mt-0.5">{getStatusBadge(viewDoc.status)}</div>
                </div>
              </div>
              {viewDoc.frontImage && (
                <div>
                  <p className="text-sm text-sbi-500 mb-1">Front Image</p>
                  <div className="rounded-lg border border-sbi-200 overflow-hidden bg-sbi-50">
                    <img src={viewDoc.frontImage} alt="Front side" className="w-full h-40 object-contain" />
                  </div>
                </div>
              )}
              {viewDoc.backImage && (
                <div>
                  <p className="text-sm text-sbi-500 mb-1">Back Image</p>
                  <div className="rounded-lg border border-sbi-200 overflow-hidden bg-sbi-50">
                    <img src={viewDoc.backImage} alt="Back side" className="w-full h-40 object-contain" />
                  </div>
                </div>
              )}
              {viewDoc.selfieImage && (
                <div>
                  <p className="text-sm text-sbi-500 mb-1">Selfie</p>
                  <div className="rounded-lg border border-sbi-200 overflow-hidden bg-sbi-50">
                    <img src={viewDoc.selfieImage} alt="Selfie" className="w-full h-40 object-contain" />
                  </div>
                </div>
              )}
              {viewDoc.remarks && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm font-medium text-red-800">Remarks</p>
                  <p className="text-sm text-red-700">{viewDoc.remarks}</p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setViewDoc(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
