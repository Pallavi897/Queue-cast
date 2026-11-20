import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActionResult,
  AppSettings,
  Canteen,
  CollegeProfile,
  MenuItem,
  NavTab,
  QueueAlert,
  QueueHistoryRecord,
  SubscriptionState,
  TriggeredNotification,
  UserAccount,
  UserRole,
} from '../types/queuecast';
import {
  createSeedCanteens,
  createSeedQueueHistory,
  SEED_ALERTS,
  SEED_COLLEGE_PROFILE,
  SEED_FAVOURITES,
  SEED_MENU_ITEMS,
  SEED_SETTINGS,
  SEED_SUBSCRIPTION,
  SEED_USERS,
} from '../data/seedData';
import { calculateWaitMinutes } from '../utils/calculations';

const STORAGE_KEYS = {
  COLLEGE_PROFILE: 'qc_college_profile',
  USERS: 'qc_users',
  CURRENT_USER: 'qc_current_user',
  CANTEENS: 'qc_canteens',
  QUEUE_HISTORY: 'qc_queue_history',
  MENU_ITEMS: 'qc_menu_items',
  ALERTS: 'qc_alerts',
  FAVOURITES: 'qc_favourites',
  SUBSCRIPTION: 'qc_subscription',
  SETTINGS: 'qc_settings',
  NOTIFICATIONS: 'qc_notifications',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface RegisterCollegePayload {
  collegeName: string;
  city: string;
  adminName: string;
  phone: string;
  email: string;
  password: string;
  studentCount: number;
  canteenCount: number;
}

interface QueueCastContextValue {
  // Auth & Navigation
  currentUser: UserAccount | null;
  activeTab: NavTab;
  selectedCanteenId: string | null;
  setActiveTab: (tab: NavTab) => void;
  openCanteenDetail: (canteenId: string) => void;
  loginWithCredentials: (email: string, password: string) => ActionResult<UserAccount>;
  loginAsDemoRole: (role: UserRole) => void;
  registerStudent: (name: string, email: string, password: string, department?: string) => ActionResult<UserAccount>;
  registerCollegeAdmin: (payload: RegisterCollegePayload) => ActionResult<UserAccount>;
  logout: () => void;

  // Collections
  collegeProfile: CollegeProfile;
  users: UserAccount[];
  canteens: Canteen[];
  queueHistory: QueueHistoryRecord[];
  menuItems: MenuItem[];
  alerts: QueueAlert[];
  favourites: string[];
  subscription: SubscriptionState;
  settings: AppSettings;
  notifications: TriggeredNotification[];
  toasts: ToastMessage[];
  lastSimulationTick: string | null;

  // Actions
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  updateQueue: (
    canteenId: string,
    peopleInQueue: number,
    avgServiceTimeMin: number,
    openCounters: number,
    isOpen: boolean,
    note: string
  ) => ActionResult;
  addCanteen: (payload: {
    name: string;
    location: string;
    openingHours: string;
    openCounters: number;
    avgServiceTimeMin: number;
  }) => ActionResult<Canteen>;
  editCanteen: (
    canteenId: string,
    payload: {
      name: string;
      location: string;
      openingHours: string;
      isOpen: boolean;
      openCounters: number;
      avgServiceTimeMin: number;
    }
  ) => ActionResult;
  deleteCanteen: (canteenId: string) => ActionResult;

  addMenuItem: (payload: Omit<MenuItem, 'id'>) => ActionResult<MenuItem>;
  editMenuItem: (itemId: string, payload: Partial<Omit<MenuItem, 'id'>>) => ActionResult;
  deleteMenuItem: (itemId: string) => ActionResult;

  toggleFavourite: (canteenId: string) => void;

  addAlert: (canteenId: string, thresholdMinutes: number) => ActionResult<QueueAlert>;
  editAlert: (alertId: string, thresholdMinutes: number) => ActionResult;
  toggleAlert: (alertId: string) => void;
  deleteAlert: (alertId: string) => ActionResult;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateCollegeProfile: (profile: CollegeProfile) => ActionResult;
  updateCurrentUserProfile: (name: string, email: string, department?: string) => ActionResult;
  updateSettings: (next: AppSettings) => ActionResult;
  toggleSimulation: (enabled?: boolean) => void;
  upgradeSubscriptionDemo: () => ActionResult;
  downgradeSubscriptionDemo: () => ActionResult;
  resetAllSampleData: () => ActionResult;
}

const QueueCastContext = createContext<QueueCastContextValue | null>(null);

export const QueueCastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collegeProfile, setCollegeProfile] = useState<CollegeProfile>(() =>
    loadFromStorage(STORAGE_KEYS.COLLEGE_PROFILE, SEED_COLLEGE_PROFILE)
  );
  const [users, setUsers] = useState<UserAccount[]>(() =>
    loadFromStorage(STORAGE_KEYS.USERS, SEED_USERS)
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() =>
    loadFromStorage<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [canteens, setCanteens] = useState<Canteen[]>(() =>
    loadFromStorage(STORAGE_KEYS.CANTEENS, createSeedCanteens())
  );
  const [queueHistory, setQueueHistory] = useState<QueueHistoryRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.QUEUE_HISTORY, createSeedQueueHistory())
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.MENU_ITEMS, SEED_MENU_ITEMS)
  );
  const [alerts, setAlerts] = useState<QueueAlert[]>(() =>
    loadFromStorage(STORAGE_KEYS.ALERTS, SEED_ALERTS)
  );
  const [favourites, setFavourites] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.FAVOURITES, SEED_FAVOURITES)
  );
  const [subscription, setSubscription] = useState<SubscriptionState>(() =>
    loadFromStorage(STORAGE_KEYS.SUBSCRIPTION, SEED_SUBSCRIPTION)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, SEED_SETTINGS)
  );
  const [notifications, setNotifications] = useState<TriggeredNotification[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSimulationTick, setLastSimulationTick] = useState<string | null>(null);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Persist each collection cleanly
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COLLEGE_PROFILE, collegeProfile);
  }, [collegeProfile]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CANTEENS, canteens);
  }, [canteens]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.QUEUE_HISTORY, queueHistory);
  }, [queueHistory]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, menuItems);
  }, [menuItems]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ALERTS, alerts);
  }, [alerts]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVOURITES, favourites);
  }, [favourites]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUBSCRIPTION, subscription);
  }, [subscription]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // Helper to evaluate alerts whenever a canteen's wait changes
  const evaluateAlertsForCanteen = useCallback(
    (canteen: Canteen, newWait: number, isManualUpdate: boolean) => {
      if (!canteen.isOpen) return;
      if (!settings.inAppAlertsEnabled) return;

      const matching = alerts.filter(
        (a) =>
          a.active &&
          a.canteenId === canteen.id &&
          newWait <= a.thresholdMinutes
      );

      if (matching.length === 0) return;

      const now = Date.now();
      const newlyTriggered: TriggeredNotification[] = [];
      const updatedAlertIds: string[] = [];

      for (const alert of matching) {
        const lastTrig = alert.lastTriggeredAt
          ? new Date(alert.lastTriggeredAt).getTime()
          : 0;
        // For simulation avoid spamming every 6s (60s cooldown), for manual updates allow immediate trigger if > 5s
        const cooldownMs = isManualUpdate ? 5000 : 60000;
        if (now - lastTrig >= cooldownMs) {
          updatedAlertIds.push(alert.id);
          newlyTriggered.push({
            id: `notif-${now}-${Math.random().toString(36).slice(2, 6)}`,
            alertId: alert.id,
            canteenId: canteen.id,
            canteenName: canteen.name,
            waitMinutes: newWait,
            thresholdMinutes: alert.thresholdMinutes,
            message: `${canteen.name} wait dropped to ${newWait} min (under your ${alert.thresholdMinutes} min alert).`,
            timestamp: new Date(now).toISOString(),
            read: false,
          });
        }
      }

      if (newlyTriggered.length > 0) {
        setNotifications((prev) => [...newlyTriggered, ...prev].slice(0, 20));
        setAlerts((prev) =>
          prev.map((a) =>
            updatedAlertIds.includes(a.id)
              ? { ...a, lastTriggeredAt: new Date(now).toISOString() }
              : a
          )
        );
      }
    },
    [alerts, settings.inAppAlertsEnabled]
  );

  // Refs for simulation interval to avoid stale closures
  const canteensRef = useRef(canteens);
  canteensRef.current = canteens;
  const evaluateAlertsRef = useRef(evaluateAlertsForCanteen);
  evaluateAlertsRef.current = evaluateAlertsForCanteen;

  useEffect(() => {
    if (!settings.simulationEnabled) return;

    const runSimulationStep = () => {
      const currentList = canteensRef.current;
      if (currentList.length === 0) return;

      const now = new Date();
      const hour = now.getHours();

      // Realistic campus meal-hour target crowd multipliers
      // Peak 12-14, moderate 10-11, low 15-16
      let targetFactor = 1.0;
      if (hour >= 12 && hour <= 14) targetFactor = 1.35;
      else if (hour >= 15 && hour <= 17) targetFactor = 0.55;
      else if (hour >= 9 && hour <= 11) targetFactor = 0.85;
      else targetFactor = 0.65;

      const newRecords: QueueHistoryRecord[] = [];
      const updatedCanteens = currentList.map((c) => {
        if (!c.isOpen) return c;
        const baseMax = c.id === 'cnt-main' ? 32 : 18;
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        const nudged = Math.round(
          Math.max(2, Math.min(baseMax, c.peopleInQueue * 0.85 + baseMax * 0.15 * targetFactor + delta))
        );
        const wait = calculateWaitMinutes(
          nudged,
          c.avgServiceTimeMin,
          c.openCounters
        );

        const updated: Canteen = {
          ...c,
          peopleInQueue: nudged,
          lastUpdated: now.toISOString(),
          isSimulatedData: true,
        };

        newRecords.push({
          id: `sim-${c.id}-${now.getTime()}-${Math.random().toString(36).slice(2, 5)}`,
          canteenId: c.id,
          canteenName: c.name,
          timestamp: now.toISOString(),
          peopleInQueue: nudged,
          avgServiceTimeMin: c.avgServiceTimeMin,
          openCounters: c.openCounters,
          waitMinutes: wait,
          note: 'Simulated crowd fluctuation (no sensors connected)',
          updatedBy: 'Live Simulation',
          isSimulated: true,
        });

        evaluateAlertsRef.current(updated, wait, false);
        return updated;
      });

      setCanteens(updatedCanteens);
      if (newRecords.length > 0) {
        setQueueHistory((prev) => [...newRecords, ...prev].slice(0, 400));
      }
      setLastSimulationTick(now.toISOString());
    };

    const intervalId = setInterval(runSimulationStep, 7000);
    return () => clearInterval(intervalId);
  }, [settings.simulationEnabled]);

  const openCanteenDetail = useCallback((canteenId: string) => {
    setSelectedCanteenId(canteenId);
    setActiveTab('canteen-detail');
  }, []);

  // Auth Actions
  const loginWithCredentials = useCallback(
    (email: string, password: string): ActionResult<UserAccount> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password.trim()) {
        return { ok: false, message: 'Please enter both email and password.' };
      }
      const found = users.find(
        (u) => u.email.toLowerCase() === normalized
      );
      if (!found) {
        return { ok: false, message: 'No account found with that email address.' };
      }
      if (found.password && found.password !== password) {
        return { ok: false, message: 'Incorrect password. Please try again.' };
      }
      setCurrentUser(found);
      setActiveTab(
        found.role === 'admin'
          ? 'dashboard'
          : found.role === 'staff'
          ? 'staff'
          : 'canteens'
      );
      return { ok: true, message: `Welcome back, ${found.name}.`, data: found };
    },
    [users]
  );

  const loginAsDemoRole = useCallback(
    (role: UserRole) => {
      const match =
        users.find((u) => u.role === role) ||
        SEED_USERS.find((u) => u.role === role) ||
        SEED_USERS[0];
      setCurrentUser(match);
      setActiveTab(
        role === 'admin' ? 'dashboard' : role === 'staff' ? 'staff' : 'canteens'
      );
      showToast(`Signed in as ${match.name} (${role})`, 'success');
    },
    [users, showToast]
  );

  const registerStudent = useCallback(
    (
      name: string,
      email: string,
      password: string,
      department?: string
    ): ActionResult<UserAccount> => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (cleanName.length < 2) {
        return { ok: false, message: 'Please enter your full name.' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, message: 'Please enter a valid email address.' };
      }
      if (password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' };
      }
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { ok: false, message: 'An account with this email already exists.' };
      }
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password,
        role: 'student',
        department: department?.trim() || 'Student',
      };
      const nextUsers = [...users, newUser];
      if (!saveToStorage(STORAGE_KEYS.USERS, nextUsers)) {
        return { ok: false, message: 'Unable to save registration in browser storage.' };
      }
      setUsers(nextUsers);
      setCollegeProfile((prev) => ({ ...prev, studentCount: prev.studentCount + 1 }));
      setCurrentUser(newUser);
      setActiveTab('canteens');
      return { ok: true, message: 'Student account created.', data: newUser };
    },
    [users]
  );

  const registerCollegeAdmin = useCallback(
    (payload: RegisterCollegePayload): ActionResult<UserAccount> => {
      if (payload.collegeName.trim().length < 3) {
        return { ok: false, message: 'College name must be at least 3 characters.' };
      }
      if (payload.city.trim().length < 2) {
        return { ok: false, message: 'Please enter a valid city.' };
      }
      if (payload.adminName.trim().length < 2) {
        return { ok: false, message: 'Please enter the admin name.' };
      }
      if (!/^[+\d\s()-]{8,18}$/.test(payload.phone.trim())) {
        return { ok: false, message: 'Please enter a valid phone number.' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        return { ok: false, message: 'Please enter a valid email address.' };
      }
      if (payload.password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' };
      }
      if (payload.studentCount < 1 || payload.canteenCount < 1) {
        return {
          ok: false,
          message: 'Student count and canteen count must each be at least 1.',
        };
      }

      const nextProfile: CollegeProfile = {
        collegeName: payload.collegeName.trim(),
        city: payload.city.trim(),
        adminName: payload.adminName.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim().toLowerCase(),
        studentCount: Math.floor(payload.studentCount),
        canteenCount: Math.floor(payload.canteenCount),
      };

      const adminUser: UserAccount = {
        id: `usr-admin-${Date.now()}`,
        name: nextProfile.adminName,
        email: nextProfile.email,
        password: payload.password,
        role: 'admin',
        phone: nextProfile.phone,
        department: 'College Administration',
      };

      const filteredUsers = users.filter(
        (u) => u.email.toLowerCase() !== adminUser.email
      );
      const nextUsers = [...filteredUsers, adminUser];

      if (
        !saveToStorage(STORAGE_KEYS.COLLEGE_PROFILE, nextProfile) ||
        !saveToStorage(STORAGE_KEYS.USERS, nextUsers)
      ) {
        return { ok: false, message: 'Failed to persist college registration.' };
      }

      setCollegeProfile(nextProfile);
      setUsers(nextUsers);
      setCurrentUser(adminUser);
      setActiveTab('dashboard');
      return {
        ok: true,
        message: `${nextProfile.collegeName} registered successfully.`,
        data: adminUser,
      };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('home');
    setSelectedCanteenId(null);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
  }, []);

  // Queue Update
  const updateQueue = useCallback(
    (
      canteenId: string,
      peopleInQueue: number,
      avgServiceTimeMin: number,
      openCounters: number,
      isOpen: boolean,
      note: string
    ): ActionResult => {
      if (!Number.isFinite(peopleInQueue) || peopleInQueue < 0) {
        return { ok: false, message: 'People in queue cannot be negative.' };
      }
      if (!Number.isFinite(avgServiceTimeMin) || avgServiceTimeMin <= 0) {
        return { ok: false, message: 'Average service time must be greater than 0 minutes.' };
      }
      if (!Number.isFinite(openCounters) || openCounters < 1) {
        return { ok: false, message: 'Number of open counters must be at least 1.' };
      }

      const target = canteens.find((c) => c.id === canteenId);
      if (!target) {
        return { ok: false, message: 'Selected canteen not found.' };
      }

      const cleanPeople = Math.round(peopleInQueue);
      const cleanService = Math.round(avgServiceTimeMin * 10) / 10;
      const cleanCounters = Math.floor(openCounters);
      const waitMinutes = calculateWaitMinutes(
        cleanPeople,
        cleanService,
        cleanCounters
      );
      const nowIso = new Date().toISOString();
      const actor = currentUser?.name || 'Canteen Staff';

      const updatedCanteen: Canteen = {
        ...target,
        peopleInQueue: cleanPeople,
        avgServiceTimeMin: cleanService,
        openCounters: cleanCounters,
        isOpen,
        lastUpdated: nowIso,
        lastNote: note.trim(),
        updatedBy: actor,
        isSimulatedData: false,
      };

      const nextCanteens = canteens.map((c) =>
        c.id === canteenId ? updatedCanteen : c
      );

      const newRecord: QueueHistoryRecord = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        canteenId,
        canteenName: target.name,
        timestamp: nowIso,
        peopleInQueue: cleanPeople,
        avgServiceTimeMin: cleanService,
        openCounters: cleanCounters,
        waitMinutes,
        note: note.trim() || (isOpen ? 'Manual staff update' : 'Canteen marked Closed'),
        updatedBy: actor,
        isSimulated: false,
      };

      const nextHistory = [newRecord, ...queueHistory];

      if (
        !saveToStorage(STORAGE_KEYS.CANTEENS, nextCanteens) ||
        !saveToStorage(STORAGE_KEYS.QUEUE_HISTORY, nextHistory)
      ) {
        return {
          ok: false,
          message: 'Could not save queue update to local storage.',
        };
      }

      setCanteens(nextCanteens);
      setQueueHistory(nextHistory);
      evaluateAlertsForCanteen(updatedCanteen, waitMinutes, true);

      return {
        ok: true,
        message: `${target.name} updated: ${waitMinutes} min estimated wait.`,
      };
    },
    [canteens, queueHistory, currentUser, evaluateAlertsForCanteen]
  );

  // Canteen CRUD
  const addCanteen = useCallback(
    (payload: {
      name: string;
      location: string;
      openingHours: string;
      openCounters: number;
      avgServiceTimeMin: number;
    }): ActionResult<Canteen> => {
      if (payload.name.trim().length < 2) {
        return { ok: false, message: 'Canteen name is required.' };
      }
      if (payload.location.trim().length < 2) {
        return { ok: false, message: 'Location is required.' };
      }
      if (payload.openCounters < 1) {
        return { ok: false, message: 'Open counters must be at least 1.' };
      }
      if (payload.avgServiceTimeMin <= 0) {
        return { ok: false, message: 'Service time must be greater than 0.' };
      }

      const newCanteen: Canteen = {
        id: `cnt-${Date.now()}`,
        name: payload.name.trim(),
        location: payload.location.trim(),
        openingHours: payload.openingHours.trim() || '9:00 AM – 5:00 PM',
        isOpen: true,
        peopleInQueue: 0,
        avgServiceTimeMin: Math.round(payload.avgServiceTimeMin * 10) / 10,
        openCounters: Math.floor(payload.openCounters),
        lastUpdated: new Date().toISOString(),
        lastNote: 'Newly added canteen',
        updatedBy: currentUser?.name || 'Admin',
        isSimulatedData: false,
      };

      const next = [...canteens, newCanteen];
      if (!saveToStorage(STORAGE_KEYS.CANTEENS, next)) {
        return { ok: false, message: 'Failed to save canteen.' };
      }
      setCanteens(next);
      setCollegeProfile((p) => ({ ...p, canteenCount: next.length }));
      return { ok: true, message: `${newCanteen.name} added.`, data: newCanteen };
    },
    [canteens, currentUser]
  );

  const editCanteen = useCallback(
    (
      canteenId: string,
      payload: {
        name: string;
        location: string;
        openingHours: string;
        isOpen: boolean;
        openCounters: number;
        avgServiceTimeMin: number;
      }
    ): ActionResult => {
      if (payload.name.trim().length < 2 || payload.location.trim().length < 2) {
        return { ok: false, message: 'Name and location are required.' };
      }
      if (payload.openCounters < 1 || payload.avgServiceTimeMin <= 0) {
        return { ok: false, message: 'Counters must be >= 1 and service time > 0.' };
      }
      const next = canteens.map((c) =>
        c.id === canteenId
          ? {
              ...c,
              name: payload.name.trim(),
              location: payload.location.trim(),
              openingHours: payload.openingHours.trim() || c.openingHours,
              isOpen: payload.isOpen,
              openCounters: Math.floor(payload.openCounters),
              avgServiceTimeMin: Math.round(payload.avgServiceTimeMin * 10) / 10,
              lastUpdated: new Date().toISOString(),
            }
          : c
      );
      if (!saveToStorage(STORAGE_KEYS.CANTEENS, next)) {
        return { ok: false, message: 'Failed to save canteen edits.' };
      }
      setCanteens(next);
      return { ok: true, message: 'Canteen details updated.' };
    },
    [canteens]
  );

  const deleteCanteen = useCallback(
    (canteenId: string): ActionResult => {
      const nextCanteens = canteens.filter((c) => c.id !== canteenId);
      if (!saveToStorage(STORAGE_KEYS.CANTEENS, nextCanteens)) {
        return { ok: false, message: 'Failed to delete canteen.' };
      }
      setCanteens(nextCanteens);
      setMenuItems((prev) => prev.filter((m) => m.canteenId !== canteenId));
      setAlerts((prev) => prev.filter((a) => a.canteenId !== canteenId));
      setFavourites((prev) => prev.filter((id) => id !== canteenId));
      setCollegeProfile((p) => ({ ...p, canteenCount: nextCanteens.length }));
      if (selectedCanteenId === canteenId) {
        setSelectedCanteenId(null);
        setActiveTab('canteens');
      }
      return { ok: true, message: 'Canteen deleted.' };
    },
    [canteens, selectedCanteenId]
  );

  // Menu CRUD
  const addMenuItem = useCallback(
    (payload: Omit<MenuItem, 'id'>): ActionResult<MenuItem> => {
      if (payload.name.trim().length < 2) {
        return { ok: false, message: 'Menu item name is required.' };
      }
      if (!Number.isFinite(payload.price) || payload.price <= 0) {
        return { ok: false, message: 'Price must be greater than ₹0.' };
      }
      const item: MenuItem = {
        ...payload,
        id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: payload.name.trim(),
        price: Math.round(payload.price),
      };
      const next = [item, ...menuItems];
      if (!saveToStorage(STORAGE_KEYS.MENU_ITEMS, next)) {
        return { ok: false, message: 'Could not save menu item.' };
      }
      setMenuItems(next);
      return { ok: true, message: `${item.name} added to menu.`, data: item };
    },
    [menuItems]
  );

  const editMenuItem = useCallback(
    (itemId: string, payload: Partial<Omit<MenuItem, 'id'>>): ActionResult => {
      if (payload.name !== undefined && payload.name.trim().length < 2) {
        return { ok: false, message: 'Menu item name cannot be empty.' };
      }
      if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price <= 0)) {
        return { ok: false, message: 'Price must be greater than ₹0.' };
      }
      const next = menuItems.map((m) =>
        m.id === itemId
          ? {
              ...m,
              ...payload,
              name: payload.name !== undefined ? payload.name.trim() : m.name,
              price: payload.price !== undefined ? Math.round(payload.price) : m.price,
            }
          : m
      );
      if (!saveToStorage(STORAGE_KEYS.MENU_ITEMS, next)) {
        return { ok: false, message: 'Could not update menu item.' };
      }
      setMenuItems(next);
      return { ok: true, message: 'Menu item updated.' };
    },
    [menuItems]
  );

  const deleteMenuItem = useCallback(
    (itemId: string): ActionResult => {
      const next = menuItems.filter((m) => m.id !== itemId);
      if (!saveToStorage(STORAGE_KEYS.MENU_ITEMS, next)) {
        return { ok: false, message: 'Could not delete menu item.' };
      }
      setMenuItems(next);
      return { ok: true, message: 'Menu item removed.' };
    },
    [menuItems]
  );

  // Favourites
  const toggleFavourite = useCallback((canteenId: string) => {
    setFavourites((prev) =>
      prev.includes(canteenId)
        ? prev.filter((id) => id !== canteenId)
        : [...prev, canteenId]
    );
  }, []);

  // Alerts
  const addAlert = useCallback(
    (canteenId: string, thresholdMinutes: number): ActionResult<QueueAlert> => {
      if (!canteenId) {
        return { ok: false, message: 'Please choose a canteen.' };
      }
      if (!Number.isFinite(thresholdMinutes) || thresholdMinutes < 1 || thresholdMinutes > 60) {
        return { ok: false, message: 'Wait threshold must be between 1 and 60 minutes.' };
      }
      const cleanThreshold = Math.round(thresholdMinutes);
      const alert: QueueAlert = {
        id: `alt-${Date.now()}`,
        userId: currentUser?.id || 'guest',
        canteenId,
        thresholdMinutes: cleanThreshold,
        active: true,
        createdAt: new Date().toISOString(),
      };
      const next = [alert, ...alerts];
      if (!saveToStorage(STORAGE_KEYS.ALERTS, next)) {
        return { ok: false, message: 'Could not save alert.' };
      }
      setAlerts(next);

      // Check immediately if canteen is already below threshold
      const targetCanteen = canteens.find((c) => c.id === canteenId);
      if (targetCanteen && targetCanteen.isOpen) {
        const currentWait = calculateWaitMinutes(
          targetCanteen.peopleInQueue,
          targetCanteen.avgServiceTimeMin,
          targetCanteen.openCounters
        );
        if (currentWait <= cleanThreshold) {
          const immediateNotif: TriggeredNotification = {
            id: `notif-${Date.now()}`,
            alertId: alert.id,
            canteenId: targetCanteen.id,
            canteenName: targetCanteen.name,
            waitMinutes: currentWait,
            thresholdMinutes: cleanThreshold,
            message: `${targetCanteen.name} is already at ${currentWait} min wait (under ${cleanThreshold} min).`,
            timestamp: new Date().toISOString(),
            read: false,
          };
          setNotifications((prev) => [immediateNotif, ...prev].slice(0, 20));
        }
      }

      return {
        ok: true,
        message: `In-app alert set for under ${cleanThreshold} min.`,
        data: alert,
      };
    },
    [alerts, currentUser, canteens]
  );

  const editAlert = useCallback(
    (alertId: string, thresholdMinutes: number): ActionResult => {
      if (!Number.isFinite(thresholdMinutes) || thresholdMinutes < 1 || thresholdMinutes > 60) {
        return { ok: false, message: 'Threshold must be between 1 and 60 minutes.' };
      }
      const next = alerts.map((a) =>
        a.id === alertId
          ? { ...a, thresholdMinutes: Math.round(thresholdMinutes) }
          : a
      );
      if (!saveToStorage(STORAGE_KEYS.ALERTS, next)) {
        return { ok: false, message: 'Failed to update alert.' };
      }
      setAlerts(next);
      return { ok: true, message: 'Alert threshold updated.' };
    },
    [alerts]
  );

  const toggleAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a))
    );
  }, []);

  const deleteAlert = useCallback(
    (alertId: string): ActionResult => {
      const next = alerts.filter((a) => a.id !== alertId);
      if (!saveToStorage(STORAGE_KEYS.ALERTS, next)) {
        return { ok: false, message: 'Failed to delete alert.' };
      }
      setAlerts(next);
      return { ok: true, message: 'Alert deleted.' };
    },
    [alerts]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Profile & Settings
  const updateCollegeProfile = useCallback(
    (profile: CollegeProfile): ActionResult => {
      if (profile.collegeName.trim().length < 3 || profile.city.trim().length < 2) {
        return { ok: false, message: 'College name and city are required.' };
      }
      if (profile.studentCount < 1) {
        return { ok: false, message: 'Student count must be at least 1.' };
      }
      if (!saveToStorage(STORAGE_KEYS.COLLEGE_PROFILE, profile)) {
        return { ok: false, message: 'Failed to save college profile.' };
      }
      setCollegeProfile(profile);
      return { ok: true, message: 'College profile saved.' };
    },
    []
  );

  const updateCurrentUserProfile = useCallback(
    (name: string, email: string, department?: string): ActionResult => {
      if (!currentUser) return { ok: false, message: 'No active user session.' };
      if (name.trim().length < 2) {
        return { ok: false, message: 'Name must be at least 2 characters.' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return { ok: false, message: 'Please enter a valid email address.' };
      }
      const updated: UserAccount = {
        ...currentUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department?.trim() || currentUser.department,
      };
      const nextUsers = users.map((u) => (u.id === updated.id ? updated : u));
      if (!saveToStorage(STORAGE_KEYS.USERS, nextUsers)) {
        return { ok: false, message: 'Failed to save user details.' };
      }
      setUsers(nextUsers);
      setCurrentUser(updated);
      return { ok: true, message: 'Profile updated.' };
    },
    [currentUser, users]
  );

  const updateSettings = useCallback((next: AppSettings): ActionResult => {
    if (
      next.thresholds.lowMaxMinutes < 2 ||
      next.thresholds.mediumMaxMinutes <= next.thresholds.lowMaxMinutes
    ) {
      return {
        ok: false,
        message: 'Low threshold must be at least 2 min and strictly less than Medium threshold.',
      };
    }
    if (next.defaultServiceTimeMin <= 0) {
      return { ok: false, message: 'Default service time must be greater than 0.' };
    }
    if (!saveToStorage(STORAGE_KEYS.SETTINGS, next)) {
      return { ok: false, message: 'Could not save settings.' };
    }
    setSettings(next);
    return { ok: true, message: 'Settings saved.' };
  }, []);

  const toggleSimulation = useCallback(
    (enabled?: boolean) => {
      setSettings((prev) => {
        const nextVal = enabled !== undefined ? enabled : !prev.simulationEnabled;
        showToast(
          nextVal
            ? 'Simulation mode ON (simulated data, no sensors connected)'
            : 'Simulation mode OFF (manual staff updates only)',
          'info'
        );
        return { ...prev, simulationEnabled: nextVal };
      });
    },
    [showToast]
  );

  const upgradeSubscriptionDemo = useCallback((): ActionResult => {
    const next: SubscriptionState = {
      plan: 'college_pro',
      status: 'active',
      monthlyPriceInr: 5000,
      activatedAt: new Date().toISOString(),
      isDemoPayment: true,
    };
    if (!saveToStorage(STORAGE_KEYS.SUBSCRIPTION, next)) {
      return { ok: false, message: 'Could not save demo subscription state.' };
    }
    setSubscription(next);
    return {
      ok: true,
      message: 'Demo Upgrade confirmed: College Plan (₹5,000/month) is now Active.',
    };
  }, []);

  const downgradeSubscriptionDemo = useCallback((): ActionResult => {
    const next: SubscriptionState = {
      plan: 'free_student',
      status: 'active',
      monthlyPriceInr: 0,
      activatedAt: new Date().toISOString(),
      isDemoPayment: true,
    };
    if (!saveToStorage(STORAGE_KEYS.SUBSCRIPTION, next)) {
      return { ok: false, message: 'Could not update demo plan.' };
    }
    setSubscription(next);
    return { ok: true, message: 'Switched to Free Student Tier (demo).' };
  }, []);

  const resetAllSampleData = useCallback((): ActionResult => {
    const freshCanteens = createSeedCanteens();
    const freshHistory = createSeedQueueHistory();
    setCollegeProfile(SEED_COLLEGE_PROFILE);
    setUsers(SEED_USERS);
    setCanteens(freshCanteens);
    setQueueHistory(freshHistory);
    setMenuItems(SEED_MENU_ITEMS);
    setAlerts(SEED_ALERTS);
    setFavourites(SEED_FAVOURITES);
    setSubscription(SEED_SUBSCRIPTION);
    setSettings(SEED_SETTINGS);
    setNotifications([]);
    if (currentUser) {
      const refreshed = SEED_USERS.find((u) => u.role === currentUser.role) || SEED_USERS[0];
      setCurrentUser(refreshed);
    }
    return { ok: true, message: 'All sample campus data restored.' };
  }, [currentUser]);

  return (
    <QueueCastContext.Provider
      value={{
        currentUser,
        activeTab,
        selectedCanteenId,
        setActiveTab,
        openCanteenDetail,
        loginWithCredentials,
        loginAsDemoRole,
        registerStudent,
        registerCollegeAdmin,
        logout,
        collegeProfile,
        users,
        canteens,
        queueHistory,
        menuItems,
        alerts,
        favourites,
        subscription,
        settings,
        notifications,
        toasts,
        lastSimulationTick,
        showToast,
        dismissToast,
        updateQueue,
        addCanteen,
        editCanteen,
        deleteCanteen,
        addMenuItem,
        editMenuItem,
        deleteMenuItem,
        toggleFavourite,
        addAlert,
        editAlert,
        toggleAlert,
        deleteAlert,
        dismissNotification,
        markAllNotificationsRead,
        updateCollegeProfile,
        updateCurrentUserProfile,
        updateSettings,
        toggleSimulation,
        upgradeSubscriptionDemo,
        downgradeSubscriptionDemo,
        resetAllSampleData,
      }}
    >
      {children}
    </QueueCastContext.Provider>
  );
};

export function useQueueCast() {
  const ctx = useContext(QueueCastContext);
  if (!ctx) {
    throw new Error('useQueueCast must be used within QueueCastProvider');
  }
  return ctx;
}
