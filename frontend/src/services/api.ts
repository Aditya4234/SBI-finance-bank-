import axios from 'axios';
import { eventBus, AppEvents } from './event-bus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

const getCorrelationId = (): string => {
  if (typeof window === 'undefined') return '';
  let cid = localStorage.getItem('correlationId');
  if (!cid) {
    cid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('correlationId', cid);
  }
  return cid;
};

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-device-id'] = localStorage.getItem('deviceId') || 'web';
    config.headers['x-device-name'] = navigator?.userAgent || 'web';
    config.headers['x-correlation-id'] = getCorrelationId();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const cid = response.headers['x-correlation-id'];
    if (cid && typeof window !== 'undefined') {
      localStorage.setItem('correlationId', cid);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken }, { withCredentials: true });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        eventBus.emit(AppEvents.AUTH_TOKEN_REFRESHED);
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        eventBus.emit(AppEvents.SESSION_EXPIRED);
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    }
    if (!error.response) {
      eventBus.emit(AppEvents.NETWORK_ERROR, { message: error.message });
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  enable2fa: () => api.post('/auth/2fa/enable'),
  verify2fa: (token: string) => api.post('/auth/2fa/verify', { token }),
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
};

export const accountApi = {
  getAll: () => api.get('/accounts'),
  open: (data: any) => api.post('/accounts/open', data),
  getBalance: (accountId: string) => api.get(`/accounts/${accountId}/balance`),
  getStatement: (accountId: string) => api.get(`/accounts/${accountId}/statement`),
  getTransactions: (accountId: string, page?: number) => api.get(`/accounts/${accountId}/transactions`, { params: { page } }),
  closeAccount: (accountId: string, reason?: string) => api.post(`/accounts/${accountId}/close`, { reason }),
  getClosedAccounts: () => api.get('/accounts/closed/all'),
};

export const transactionApi = {
  transfer: (data: any) => api.post('/transactions/transfer', data),
  getHistory: (page?: number) => api.get('/transactions/history', { params: { page } }),
  upiPayment: (data: any) => api.post('/transactions/upi/pay', data),
  getUpiHistory: (page?: number) => api.get('/transactions/upi/history', { params: { page } }),
};

export const beneficiaryApi = {
  getAll: () => api.get('/beneficiaries'),
  add: (data: any) => api.post('/beneficiaries', data),
  update: (id: string, data: any) => api.put(`/beneficiaries/${id}`, data),
  delete: (id: string) => api.delete(`/beneficiaries/${id}`),
};

export const loanApi = {
  apply: (data: any) => api.post('/loans/apply', data),
  getAll: () => api.get('/loans'),
  getStatus: (loanId: string) => api.get(`/loans/${loanId}`),
  calculateEmi: (data: any) => api.post('/loans/calculate-emi', data),
};

export const corporateApi = {
  createCompany: (data: any) => api.post('/corporate/create-company', data),
  getCompany: () => api.get('/corporate/company'),
  addEmployee: (data: any) => api.post('/corporate/add-employee', data),
  openAccount: (data: any) => api.post('/corporate/open-account', data),
  getAccounts: () => api.get('/corporate/accounts'),
  bulkPayment: (data: any) => api.post('/corporate/bulk-payment', data),
  getTransactions: (page?: number) => api.get('/corporate/transactions', { params: { page } }),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenue: (period?: string) => api.get('/admin/revenue', { params: { period } }),
  getFraud: () => api.get('/admin/fraud'),
  getCustomers: (page?: number, search?: string) => api.get('/admin/customers', { params: { page, search } }),
  getPendingKyc: (page?: number) => api.get('/admin/kyc/pending', { params: { page } }),
  approveKyc: (documentId: string) => api.post(`/admin/kyc/${documentId}/approve`),
  rejectKyc: (documentId: string, remarks: string) => api.post(`/admin/kyc/${documentId}/reject`, { remarks }),
  getLoans: (page?: number) => api.get('/admin/loans', { params: { page } }),
  approveLoan: (loanId: string) => api.post(`/admin/loans/${loanId}/approve`),
  rejectLoan: (loanId: string, remarks: string) => api.post(`/admin/loans/${loanId}/reject`, { remarks }),
  disburseLoan: (loanId: string, accountNumber: string) => api.post('/admin/loans/disburse', { loanId, accountNumber }),
  freezeAccount: (accountId: string, type: string) => api.post(`/admin/accounts/${type}/${accountId}/freeze`),
  unfreezeAccount: (accountId: string, type: string) => api.post(`/admin/accounts/${type}/${accountId}/unfreeze`),
  getReport: (type: string) => api.get(`/admin/reports/${type}`),
  getQueueMetrics: () => api.get('/queue/metrics'),
  retryFailedJobs: () => api.post('/queue/retry-failed'),
};

export const cardApi = {
  getAll: () => api.get('/cards'),
  getById: (id: string) => api.get(`/cards/${id}`),
  issueDebit: (data: { accountId: string; cardNetwork?: string }) => api.post('/cards/debit/issue', data),
  issueCredit: (data: { cardNetwork: string; creditLimit: number }) => api.post('/cards/credit/issue', data),
  block: (id: string) => api.post(`/cards/${id}/block`),
  unblock: (id: string) => api.post(`/cards/${id}/unblock`),
  setLimits: (id: string, data: { dailyLimit?: number; monthlyLimit?: number }) => api.put(`/cards/${id}/limits`, data),
  toggleInternational: (id: string) => api.post(`/cards/${id}/toggle-international`),
  toggleContactless: (id: string) => api.post(`/cards/${id}/toggle-contactless`),
  setPin: (id: string) => api.post(`/cards/${id}/set-pin`),
  cancel: (id: string) => api.post(`/cards/${id}/cancel`),
};

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),
};

export const depositApi = {
  getFixedDeposits: () => api.get('/deposits/fixed'),
  openFixedDeposit: (data: any) => api.post('/deposits/fixed/open', data),
  closeFixedDeposit: (id: string) => api.post(`/deposits/fixed/${id}/close`),
  getRecurringDeposits: () => api.get('/deposits/recurring'),
  openRecurringDeposit: (data: any) => api.post('/deposits/recurring/open', data),
  makeRdPayment: (id: string) => api.post(`/deposits/recurring/${id}/pay`),
  closeRecurringDeposit: (id: string) => api.post(`/deposits/recurring/${id}/close`),
};

export const standingInstructionApi = {
  getAll: () => api.get('/standing-instructions'),
  create: (data: any) => api.post('/standing-instructions', data),
  getById: (id: string) => api.get(`/standing-instructions/${id}`),
  update: (id: string, data: any) => api.put(`/standing-instructions/${id}`, data),
  cancel: (id: string) => api.post(`/standing-instructions/${id}/cancel`),
  pause: (id: string) => api.post(`/standing-instructions/${id}/pause`),
  resume: (id: string) => api.post(`/standing-instructions/${id}/resume`),
};

export const serviceRequestApi = {
  getAll: () => api.get('/service-requests'),
  create: (data: any) => api.post('/service-requests', data),
  getById: (id: string) => api.get(`/service-requests/${id}`),
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put('/profile/change-password', data),
  updateProfileImage: (data: { imageUrl: string }) => api.put('/profile/profile-image', data),
};

export const auditLogApi = {
  getMyLogs: (params?: { page?: number; limit?: number }) => api.get('/audit-logs', { params }),
};

export const billPaymentApi = {
  payBill: (data: any) => api.post('/bills/pay', data),
  recharge: (data: any) => api.post('/bills/recharge', data),
  getHistory: (params?: { page?: number }) => api.get('/bills', { params }),
  getPending: () => api.get('/bills/pending'),
  getById: (id: string) => api.get(`/bills/${id}`),
  schedule: (data: any) => api.post('/bills/schedule', data),
};

export const chequeApi = {
  requestBook: (data: any) => api.post('/cheques/request', data),
  getAll: () => api.get('/cheques'),
  getByAccount: (accountId: string) => api.get(`/cheques/account/${accountId}`),
  getById: (id: string) => api.get(`/cheques/${id}`),
  stopCheque: (leafId: string, reason?: string) => api.post(`/cheques/stop/${leafId}`, { reason }),
  stopByNumber: (data: { accountNumber: string; leafNumber: number; reason?: string }) => api.post('/cheques/stop-by-number', data),
  getStatus: (leafNumber: number, accountNumber: string) => api.get(`/cheques/status/${leafNumber}/${accountNumber}`),
};

export const nriAccountApi = {
  open: (data: any) => api.post('/nri-accounts/open', data),
  getAll: () => api.get('/nri-accounts'),
  getById: (accountId: string) => api.get(`/nri-accounts/${accountId}`),
  update: (accountId: string, data: any) => api.put(`/nri-accounts/${accountId}`, data),
};

export const kycApi = {
  getMyDocuments: () => api.get('/kyc/my-documents'),
  upload: (data: any) => api.post('/kyc/upload', data),
};
