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
import { profileApi } from '@/services/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatDate, maskMobile } from '@/lib/utils';
import { useToast } from '@/components/ui/toaster';
import {
  User, Mail, Phone, Shield, Key, Smartphone, Edit3, Check, X, Clock,
  FileText, Bell, AlertTriangle, RefreshCw, Eye, EyeOff, Save
} from 'lucide-react';

export default function ProfilePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { user: reduxUser } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', mobile: '' });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const { data: profileRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });

  const profileData = profileRes?.data?.data || reduxUser;

  const updateMutation = useMutation({
    mutationFn: (data: any) => profileApi.updateProfile(data),
    onSuccess: () => {
      addToast({ title: 'Profile updated successfully', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to update profile', variant: 'error' }),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => profileApi.changePassword(data),
    onSuccess: () => {
      addToast({ title: 'Password changed successfully', variant: 'success' });
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    },
    onError: (err: any) => addToast({ title: err.response?.data?.message || 'Failed to change password', variant: 'error' }),
  });

  const startEditing = () => {
    setEditForm({ fullName: profileData?.fullName || '', mobile: profileData?.mobile || '' });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editForm);
  };

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (!mounted) return null;

  if (!profileData) {
    return (
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-sbi-300 mx-auto mb-3" />
            <p className="text-sbi-500">Unable to load profile.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sbi-900">Profile</h1>
          <p className="text-sbi-500">Manage your personal information and security settings</p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a href="/notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</a>
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="animate-pulse flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-sbi-100" />
              <div className="space-y-3 flex-1">
                <div className="h-5 w-48 rounded bg-sbi-100" />
                <div className="h-4 w-32 rounded bg-sbi-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isError && !profileData && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-sbi-600 mb-3">Failed to load profile data</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {profileData && (
        <>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-sbi-600 text-white text-xl">{getInitials(profileData.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-sbi-900">{profileData.fullName}</h2>
                  <p className="text-sbi-500 capitalize">{profileData.role?.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={cancelEditing}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-1" />
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><User className="inline h-5 w-5 mr-2" /> Personal Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} required />
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sbi-500">Full Name</span>
                      <span className="font-medium">{profileData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sbi-500">Email</span>
                      <span className="font-medium">{profileData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sbi-500">Mobile</span>
                      <span className="font-medium">{profileData.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sbi-500">Email Verified</span>
                      <Badge variant={profileData.isVerified ? 'success' : 'warning'}>
                        {profileData.isVerified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><Shield className="inline h-5 w-5 mr-2" /> Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sbi-500">KYC Status</span>
                  <Badge variant={profileData.isKycCompleted ? 'success' : profileData.isKycCompleted === false ? 'warning' : 'secondary'}>
                    {profileData.isKycCompleted ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sbi-500">2FA</span>
                  <Badge variant={profileData.twoFactorEnabled ? 'success' : 'secondary'}>
                    {profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sbi-500">Role</span>
                  <span className="font-medium capitalize">{profileData.role?.replace('_', ' ')}</span>
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Key className="mr-2 h-4 w-4" /> Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter current password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          />
                          <button type="button" className="absolute right-3 top-2.5 text-sbi-400" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && <p className="text-xs text-red-600">{passwordErrors.currentPassword}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                        {passwordErrors.newPassword && <p className="text-xs text-red-600">{passwordErrors.newPassword}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Re-enter new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                        {passwordErrors.confirmPassword && <p className="text-xs text-red-600">{passwordErrors.confirmPassword}</p>}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                        <Button type="submit" disabled={passwordMutation.isPending}>
                          {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle><FileText className="inline h-5 w-5 mr-2" /> KYC Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-sbi-500">KYC Status</span>
                    <Badge variant={profileData.isKycCompleted ? 'success' : 'warning'}>
                      {profileData.isKycCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-sbi-500">Documents</span>
                    <span className="text-sm font-medium">{profileData.isKycCompleted ? 'Verified' : 'Not submitted'}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <a href="/dashboard/kyc">
                      {profileData.isKycCompleted ? 'View KYC Documents' : 'Complete KYC'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><Clock className="inline h-5 w-5 mr-2" /> Account Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sbi-500">Member Since</span>
                  <span className="text-sm font-medium">{profileData.createdAt ? formatDate(profileData.createdAt) : 'N/A'}</span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard/audit-log"><FileText className="mr-2 h-4 w-4" /> View Audit History</a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/notifications"><Bell className="mr-2 h-4 w-4" /> Notification Settings</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
