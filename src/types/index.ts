export interface User {
  id: string;
  email: string;
  username: string;
  balance: number; // in points
  totalEarned: number;
  createdAt: Date;
}

export interface OfferWall {
  id: string;
  name: string;
  slug: 'freecash' | 'playful' | 'auto-insurance' | 'fluent';
  description: string;
  icon: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'withdraw' | 'bonus';
  amount: number;
  source: string; // offer wall slug or 'withdrawal'
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'paypal' | 'giftcard' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
}
