
import { UserProfile, Transaction, Customer, ActiveTrustLine } from './types';

export const MOCK_USER: UserProfile = {
  name: 'CONFERENCE CARL',
  id: '6032 1234 5678 8888',
  trustLimit: 500000,
  availableLimit: 425000,
  trustScore: 842,
  cardTier: 'CENTURION',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-05-20', amount: 1200, description: 'Premium Groceries', status: 'SETTLED', type: 'DEBIT' },
  { id: '2', date: '2024-05-18', amount: 5500, description: 'Electronics Hub', status: 'PENDING', type: 'DEBIT' },
  { id: '3', date: '2024-05-15', amount: 10000, description: 'Monthly Settlement', status: 'SETTLED', type: 'CREDIT' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'Rajesh Khanna', phone: '+91 98271 22341', totalDue: 12500, lastActive: '2 hours ago', trustRating: 4.8 },
  { id: 'C2', name: 'Anjali Sharma', phone: '+91 88211 44552', totalDue: 3400, lastActive: '1 day ago', trustRating: 4.9 },
  { id: 'C3', name: 'Vikram Singh', phone: '+91 77665 11223', totalDue: 45000, lastActive: 'Just now', trustRating: 4.2 },
];

export const MOCK_TRUST_LINES: ActiveTrustLine[] = [
  { id: 'T1', merchantName: 'Verma Electronics', limit: 100000, utilized: 45000, category: 'Retail' },
  { id: 'T2', merchantName: 'Elite Motors', limit: 250000, utilized: 120000, category: 'Automotive' },
  { id: 'T3', merchantName: 'Royal Jewelers', limit: 150000, utilized: 0, category: 'Luxury' },
];
