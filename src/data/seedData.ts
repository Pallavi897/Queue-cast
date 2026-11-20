import {
  AppSettings,
  Canteen,
  CollegeProfile,
  MenuItem,
  QueueAlert,
  QueueHistoryRecord,
  SubscriptionState,
  UserAccount,
} from '../types/queuecast';
import { calculateWaitMinutes } from '../utils/calculations';

export const SEED_COLLEGE_PROFILE: CollegeProfile = {
  collegeName: 'Sreenidhi Institute of Science and Technology',
  city: 'Hyderabad',
  adminName: 'Dr. Kavitha Reddy',
  phone: '+91 98490 11234',
  email: 'admin@sreenidhi.edu.in',
  studentCount: 6500,
  canteenCount: 3,
};

export const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-student-1',
    name: 'Aarav Kumar',
    email: 'aarav.kumar@sreenidhi.edu.in',
    password: 'password123',
    role: 'student',
    department: 'CSE · 3rd Year',
  },
  {
    id: 'usr-student-2',
    name: 'Ananya Rao',
    email: 'ananya.rao@sreenidhi.edu.in',
    password: 'password123',
    role: 'student',
    department: 'ECE · 2nd Year',
  },
  {
    id: 'usr-student-3',
    name: 'Nithish Kumar',
    email: 'nithish.kumar@sreenidhi.edu.in',
    password: 'password123',
    role: 'student',
    department: 'IT · 4th Year',
  },
  {
    id: 'usr-staff-1',
    name: 'Ramesh Verma',
    email: 'staff.canteen@sreenidhi.edu.in',
    password: 'password123',
    role: 'staff',
    department: 'Main Canteen Counter Lead',
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Kavitha Reddy',
    email: 'admin@sreenidhi.edu.in',
    password: 'password123',
    role: 'admin',
    department: 'Campus Operations',
  },
];

export function createSeedCanteens(): Canteen[] {
  const now = Date.now();
  return [
    {
      id: 'cnt-main',
      name: 'Main Canteen',
      location: 'Ground floor · Academic Block A',
      openingHours: '8:00 AM – 6:00 PM',
      isOpen: true,
      peopleInQueue: 27,
      avgServiceTimeMin: 2.0,
      openCounters: 3,
      lastUpdated: new Date(now - 2 * 60 * 1000).toISOString(),
      lastNote: 'Lunch rush active — Veg Thali fresh batch ready',
      updatedBy: 'Ramesh Verma',
      isSimulatedData: false,
    },
    {
      id: 'cnt-juice',
      name: 'Juice and Snacks Corner',
      location: 'Central Courtyard · Near Library',
      openingHours: '8:30 AM – 7:00 PM',
      isOpen: true,
      peopleInQueue: 8,
      avgServiceTimeMin: 1.5,
      openCounters: 2,
      lastUpdated: new Date(now - 5 * 60 * 1000).toISOString(),
      lastNote: 'Fresh watermelon & lime juice stocked',
      updatedBy: 'Ramesh Verma',
      isSimulatedData: false,
    },
    {
      id: 'cnt-staff',
      name: 'Staff Canteen',
      location: '1st Floor · Admin & Faculty Block',
      openingHours: '8:30 AM – 5:00 PM',
      isOpen: true,
      peopleInQueue: 12,
      avgServiceTimeMin: 2.0,
      openCounters: 2,
      lastUpdated: new Date(now - 4 * 60 * 1000).toISOString(),
      lastNote: 'Filter coffee & grilled sandwiches available',
      updatedBy: 'Ramesh Verma',
      isSimulatedData: false,
    },
  ];
}

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    canteenId: 'cnt-main',
    name: 'Veg Thali (Unlimited Rice & Curries)',
    category: 'Meals',
    price: 75,
    available: true,
  },
  {
    id: 'menu-2',
    canteenId: 'cnt-main',
    name: 'Crispy Punjabi Samosa (2 pcs)',
    category: 'Snacks',
    price: 25,
    available: true,
  },
  {
    id: 'menu-3',
    canteenId: 'cnt-main',
    name: 'Grilled Veg Cheese Sandwich',
    category: 'Snacks',
    price: 50,
    available: true,
  },
  {
    id: 'menu-4',
    canteenId: 'cnt-main',
    name: 'Masala Tea & Filter Coffee',
    category: 'Beverages',
    price: 20,
    available: true,
  },
  {
    id: 'menu-5',
    canteenId: 'cnt-main',
    name: 'Paneer Biryani Bowl',
    category: 'Meals',
    price: 110,
    available: false,
  },
  {
    id: 'menu-6',
    canteenId: 'cnt-juice',
    name: 'Fresh Watermelon Juice',
    category: 'Beverages',
    price: 40,
    available: true,
  },
  {
    id: 'menu-7',
    canteenId: 'cnt-juice',
    name: 'Veg Mayo Club Sandwich',
    category: 'Snacks',
    price: 55,
    available: true,
  },
  {
    id: 'menu-8',
    canteenId: 'cnt-juice',
    name: 'Samosa Chaat',
    category: 'Snacks',
    price: 35,
    available: true,
  },
  {
    id: 'menu-9',
    canteenId: 'cnt-juice',
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 45,
    available: true,
  },
  {
    id: 'menu-10',
    canteenId: 'cnt-staff',
    name: 'Executive Veg Thali',
    category: 'Meals',
    price: 90,
    available: true,
  },
  {
    id: 'menu-11',
    canteenId: 'cnt-staff',
    name: 'Toasted Paneer Sandwich',
    category: 'Snacks',
    price: 60,
    available: true,
  },
  {
    id: 'menu-12',
    canteenId: 'cnt-staff',
    name: 'Madras Filter Coffee & Ginger Tea',
    category: 'Beverages',
    price: 20,
    available: true,
  },
  {
    id: 'menu-13',
    canteenId: 'cnt-staff',
    name: 'Hot Samosa (2 pcs)',
    category: 'Snacks',
    price: 25,
    available: true,
  },
];

/**
 * Generates realistic hourly history across Today and the past 6 days:
 * Low at 9 AM, rising towards 12 PM – 1 PM peak, falling by 3 PM – 4 PM.
 */
export function createSeedQueueHistory(): QueueHistoryRecord[] {
  const records: QueueHistoryRecord[] = [];
  const now = new Date();

  const canteenProfiles = [
    {
      id: 'cnt-main',
      name: 'Main Canteen',
      serviceTime: 2.0,
      counters: 3,
      // hourly people count for 9..16
      pattern: [6, 10, 17, 29, 32, 18, 8, 5],
      notes: [
        'Breakfast counter steady',
        'Mid-morning tea break',
        'Pre-lunch crowd building',
        'Peak lunch rush started',
        'Highest lunch wave — all 3 counters active',
        'Lunch rush easing',
        'Quiet afternoon window',
        'Evening snacks prep',
      ],
    },
    {
      id: 'cnt-juice',
      name: 'Juice and Snacks Corner',
      serviceTime: 1.5,
      counters: 2,
      pattern: [4, 7, 10, 15, 16, 11, 6, 5],
      notes: [
        'Morning juice prep',
        'Quick snack orders',
        'Moderate break crowd',
        'Afternoon cold drinks rush',
        'Peak afternoon orders',
        'Normal flow',
        'Very short wait',
        'Evening chillers open',
      ],
    },
    {
      id: 'cnt-staff',
      name: 'Staff Canteen',
      serviceTime: 2.0,
      counters: 2,
      pattern: [3, 6, 9, 15, 17, 10, 5, 4],
      notes: [
        'Morning coffee service',
        'Faculty tea break',
        'Steady pre-lunch',
        'Lunch hour busy',
        'Faculty lunch peak',
        'Afternoon calm',
        'Quiet tea service',
        'Closing prep soon',
      ],
    },
  ];

  const hours = [9, 10, 11, 12, 13, 14, 15, 16];

  // Create 7 days (offset 6 down to 0 = today)
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const dayVariance = dayOffset === 0 ? 0 : ((dayOffset % 3) - 1) * 2;
    for (const profile of canteenProfiles) {
      hours.forEach((hour, idx) => {
        const d = new Date(now);
        d.setDate(now.getDate() - dayOffset);
        d.setHours(hour, 15, 0, 0);

        const people = Math.max(
          2,
          profile.pattern[idx] + (idx >= 3 && idx <= 4 ? dayVariance : Math.round(dayVariance / 2))
        );
        const waitMinutes = calculateWaitMinutes(
          people,
          profile.serviceTime,
          profile.counters
        );

        records.push({
          id: `hist-${profile.id}-d${dayOffset}-h${hour}`,
          canteenId: profile.id,
          canteenName: profile.name,
          timestamp: d.toISOString(),
          peopleInQueue: people,
          avgServiceTimeMin: profile.serviceTime,
          openCounters: profile.counters,
          waitMinutes,
          note: profile.notes[idx],
          updatedBy: 'Sample Schedule Data',
          isSimulated: true,
        });
      });
    }
  }

  return records.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export const SEED_ALERTS: QueueAlert[] = [
  {
    id: 'alt-1',
    userId: 'usr-student-1',
    canteenId: 'cnt-main',
    thresholdMinutes: 10,
    active: true,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

export const SEED_FAVOURITES: string[] = ['cnt-main'];

export const SEED_SUBSCRIPTION: SubscriptionState = {
  plan: 'college_pro',
  status: 'trial',
  monthlyPriceInr: 5000,
  activatedAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  isDemoPayment: true,
};

export const SEED_SETTINGS: AppSettings = {
  thresholds: {
    lowMaxMinutes: 8,
    mediumMaxMinutes: 15,
  },
  defaultServiceTimeMin: 2.0,
  inAppAlertsEnabled: true,
  highlightLowWaitCards: true,
  simulationEnabled: false,
};
