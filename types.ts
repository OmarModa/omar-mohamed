
// Fix: Import ComponentType to resolve 'Cannot find namespace React' error.
import type { ComponentType } from 'react';

export enum UserRole {
  Customer = 'customer',
  Provider = 'provider',
  Admin = 'admin',
}

export enum RequestStatus {
  Open = 'open',
  Assigned = 'assigned',
  Completed = 'completed',
}

export enum BidStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export interface User {
  id: number;
  uuid?: string;
  name: string;
  role: UserRole;
  contactInfo: string;
  region: string;
  address?: string;
  registeredAt: Date;
  verificationVideoUrl?: string;
  specializationId?: number;
}

export interface Category {
  id: number;
  name: string;
  // Fix: Use the imported ComponentType directly.
  icon: ComponentType<{ className?: string }>;
}

export interface ServiceRequest {
  id: number;
  customerId: number;
  customerUuid?: string;
  title: string;
  description: string;
  categoryId: number;
  region: string;
  status: RequestStatus;
  createdAt: Date;
  assignedProviderId?: number;
  acceptedBidId?: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  completedAt?: Date;
  suggestedBudget?: number;
}

export interface Bid {
  id: number;
  requestId: number;
  providerId: number;
  price: number;
  message?: string;
  status: BidStatus;
}

export interface Rating {
  id: number;
  requestId: number;
  providerId: number;
  customerId: number;
  score: number; // 1 to 10
}

export interface AppNotification {
    id: number;
    userId: number; // The recipient
    message: string;
    type: 'info' | 'success' | 'alert';
    relatedRequestId?: number;
    isRead: boolean;
    createdAt: Date;
}