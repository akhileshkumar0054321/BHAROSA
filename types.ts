
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SHOPKEEPER = 'SHOPKEEPER',
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'SETTLED';
  type: 'DEBIT' | 'CREDIT';
}

export interface UserProfile {
  name: string;
  id: string;
  trustLimit: number;
  availableLimit: number;
  trustScore: number;
  cardTier: 'CENTURION' | 'PLATINUM' | 'GOLD';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDue: number;
  lastActive: string;
  trustRating: number;
}

export interface ActiveTrustLine {
  id: string;
  merchantName: string;
  limit: number;
  utilized: number;
  category: string;
}

export interface BankOffer {
  id: string;
  bankName: string;
  maxAmount: number;
  baseInterest: number;
  minScore: number;
  logoColor: string;
}

export interface RegistrationData {
  ownerName: string;
  aadhaar: string;
  phone: string;
  panName: string;
  dob: string;
  panNumber: string;
  income: string;
  location?: { lat: number; lng: number; address: string };
  fingerprintVerified: boolean;
  faceVerified: boolean;
  shopkeeperId?: string;
  alphanumericId?: string;
}

export interface ShopkeeperSession extends RegistrationData {
  isRegistered: boolean;
}
