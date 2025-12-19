
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
  fingerprintHash?: string;
  faceHash?: string;
}

export interface Rating {
  id: string;
  shopName: string;
  shopId: string;
  value: number;
  comment: string;
  date: string;
  location: string;
}

export interface ShopInfo {
  id: string;
  name: string;
  location: string;
  avgRating: number;
  totalRatings: number;
  trustLevel: 'GOOD' | 'AVERAGE' | 'POOR';
  isVerified: boolean;
  comments?: string[];
  media?: string[];
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
  fingerprintHash?: string;
  faceHash?: string;
}

export interface ShopkeeperSession extends RegistrationData {
  isRegistered: boolean;
}

export interface CustomerRegistrationData {
  name: string;
  phone: string;
  fingerprintVerified: boolean;
  faceVerified: boolean;
  customerId: string;
  fingerprintHash?: string;
  faceHash?: string;
}

export interface CustomerSession extends CustomerRegistrationData {
  isRegistered: boolean;
}
