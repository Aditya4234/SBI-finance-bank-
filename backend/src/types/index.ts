import { Request } from 'express';
import { UserRole } from '../models/User';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  companyId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  ipAddress?: string;
  deviceId?: string;
  deviceName?: string;
  correlationId?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoanDocument {
  name: string;
  url: string;
  type: string;
}

export interface Guarantor {
  name: string;
  email: string;
  mobile: string;
  pan: string;
}

export interface Collateral {
  type: string;
  value: number;
  description: string;
}
