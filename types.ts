
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  SUPERVISOR = 'SUPERVISOR'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

export interface UserApp {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  agentCode?: string;
  phone?: string;
  createdAt: string;
}

export enum ProspectStatus {
  PENDING = 'PENDING',
  CONVERTED = 'CONVERTED'
}

export interface Prospect {
  id: string;
  agentId: string;
  fullName: string;
  company?: string;
  phone: string;
  countryCode: string;
  country: string;
  city: string;
  email: string;
  source: string;
  productOfInterest: string;
  details?: string;
  status: ProspectStatus;
  createdAt: string;
}

// Leads captured via external link
export interface RemoteProspect extends Omit<Prospect, 'status'> {
  isVerified: boolean;
}

export interface Client {
  id: string;
  agentId: string;
  prospectId: string;
  fullName: string;
  company?: string;
  email: string;
  phone: string;
  country: string;
  product: string;
  status: 'PENDING' | 'SALE_CONCLUDED' | 'CANCELLED';
  deletionReason?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  agentId: string;
  amount: number;
  profit: number;
  commission: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

export interface AccessCode {
  id: string;
  code: string;
  expiresAt: string;
  isActive: boolean;
}

export interface NotificationApp {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'user' | 'lead' | 'cash' | 'sys' | 'alert';
  read: boolean;
  createdAt: string;
}
