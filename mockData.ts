
import { UserRole, UserStatus, UserApp, ProspectStatus, Prospect, AccessCode, Sale } from './types';

export const mockUsers: UserApp[] = [
  { id: '1', firstName: 'Jean', lastName: 'Admin', email: 'admin@crm.com', role: UserRole.ADMIN, status: UserStatus.ACTIVE, createdAt: '2023-01-01' },
  { id: '2', firstName: 'Alice', lastName: 'Agent', email: 'agent@crm.com', role: UserRole.AGENT, status: UserStatus.ACTIVE, agentCode: 'AG-123', phone: '0612345678', createdAt: '2023-05-10' },
  { id: '3', firstName: 'Marc', lastName: 'Super', email: 'supervisor@crm.com', role: UserRole.SUPERVISOR, status: UserStatus.ACTIVE, createdAt: '2023-06-15' },
  { id: '4', firstName: 'Sophie', lastName: 'Pending', email: 'sophie@crm.com', role: UserRole.AGENT, status: UserStatus.PENDING, createdAt: '2024-03-20' },
];

export const mockProspects: Prospect[] = [
  { 
    id: 'p1', 
    agentId: '2', 
    fullName: 'Paul Durand', 
    phone: '0102030405', 
    countryCode: '+225',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    email: 'paul@email.com', 
    source: 'Facebook', 
    productOfInterest: 'Pack Enterprise V6',
    status: ProspectStatus.PENDING, 
    createdAt: '2024-03-22' 
  },
  { 
    id: 'p2', 
    agentId: '2', 
    fullName: 'SARL Global Trade', 
    phone: '0677889900', 
    countryCode: '+221',
    country: 'Sénégal',
    city: 'Dakar',
    email: 'contact@globaltrade.sn', 
    source: 'Instagram', 
    productOfInterest: 'Solution CRM Cloud',
    status: ProspectStatus.PENDING, 
    createdAt: '2024-03-21' 
  },
];

export const mockSales: Sale[] = [
  { id: 's1', clientId: 'c1', agentId: '2', amount: 1500, profit: 450, commission: 150, status: 'PAID', createdAt: '2024-03-20' },
  { id: 's2', clientId: 'c2', agentId: '2', amount: 2000, profit: 600, commission: 200, status: 'PENDING', createdAt: '2024-03-22' },
];

export const initialAccessCode: AccessCode = {
  id: 'ac1',
  code: 'CRM-2024-V6',
  expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  isActive: true
};
