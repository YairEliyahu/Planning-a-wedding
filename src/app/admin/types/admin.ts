export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  location?: string;
  phone?: string;
  idNumber?: string;
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerIdNumber?: string;
  weddingDate?: Date;
  expectedGuests?: string;
  weddingLocation?: string;
  budget?: string;
  preferences?: {
    venue: boolean;
    catering: boolean;
    photography: boolean;
    music: boolean;
    design: boolean;
  };
  isProfileComplete?: boolean;
  sharedEventId?: string;
  connectedUserId?: string;
  isMainEventOwner?: boolean;
  partnerInvitePending?: boolean;
  partnerInviteAccepted?: boolean;
  role: 'user' | 'admin';
  authProvider: 'google' | 'email' | 'hybrid';
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  completedProfiles: number;
  connectedCouples: number;
  newUsersThisMonth: number;
  recentActivity: number;
}

export interface AdminAuthCredentials {
  username: string;
  password: string;
}

export interface AdminContextType {
  isAuthenticated: boolean;
  authenticate: (credentials: AdminAuthCredentials) => Promise<boolean>;
  logout: () => void;
}

export interface UserAction {
  type: 'DELETE' | 'RESET_PASSWORD' | 'TOGGLE_ACTIVE' | 'UPDATE_ROLE';
  userId: string;
  payload?: any;
} 