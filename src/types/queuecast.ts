export type UserRole = 'student' | 'staff' | 'admin';

export type QueueLevel = 'Low' | 'Medium' | 'High';

export type NavTab =
  | 'home'
  | 'canteens'
  | 'canteen-detail'
  | 'staff'
  | 'dashboard'
  | 'reports'
  | 'alerts'
  | 'subscription'
  | 'help'
  | 'settings';

export interface CollegeProfile {
  collegeName: string;
  city: string;
  adminName: string;
  phone: string;
  email: string;
  studentCount: number;
  canteenCount: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

export interface Canteen {
  id: string;
  name: string;
  location: string;
  openingHours: string;
  isOpen: boolean;
  peopleInQueue: number;
  avgServiceTimeMin: number;
  openCounters: number;
  lastUpdated: string; // ISO string
  lastNote: string;
  updatedBy: string;
  isSimulatedData?: boolean;
}

export interface QueueHistoryRecord {
  id: string;
  canteenId: string;
  canteenName: string;
  timestamp: string; // ISO string
  peopleInQueue: number;
  avgServiceTimeMin: number;
  openCounters: number;
  waitMinutes: number;
  note: string;
  updatedBy: string;
  isSimulated: boolean;
}

export interface MenuItem {
  id: string;
  canteenId: string;
  name: string;
  category: 'Meals' | 'Snacks' | 'Beverages';
  price: number; // in INR
  available: boolean;
}

export interface QueueAlert {
  id: string;
  userId: string;
  canteenId: string;
  thresholdMinutes: number;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface TriggeredNotification {
  id: string;
  alertId: string;
  canteenId: string;
  canteenName: string;
  waitMinutes: number;
  thresholdMinutes: number;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SubscriptionState {
  plan: 'free_student' | 'college_pro';
  status: 'active' | 'trial';
  monthlyPriceInr: number;
  activatedAt: string;
  isDemoPayment: true;
}

export interface QueueThresholds {
  lowMaxMinutes: number; // strictly under this is Low (default 8)
  mediumMaxMinutes: number; // up to this inclusive is Medium (default 15), above is High
}

export interface AppSettings {
  thresholds: QueueThresholds;
  defaultServiceTimeMin: number;
  inAppAlertsEnabled: boolean;
  highlightLowWaitCards: boolean;
  simulationEnabled: boolean;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}
