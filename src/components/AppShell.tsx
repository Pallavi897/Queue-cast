import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  CreditCard,
  FileSpreadsheet,
  HelpCircle,
  Home,
  LogOut,
  MoreHorizontal,
  Settings,
  Store,
  UserCheck,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useQueueCast } from '../context/QueueCastContext';
import { NavTab, UserRole } from '../types/queuecast';
import { Logo } from './Logo';
import { ToastBanner } from './ToastBanner';

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home, roles: ['student', 'staff', 'admin'] },
  { id: 'canteens', label: 'Canteens', icon: Store, roles: ['student', 'staff', 'admin'] },
  { id: 'staff', label: 'Staff Panel', icon: UtensilsCrossed, roles: ['staff', 'admin'] },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin'] },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet, roles: ['admin'] },
  { id: 'alerts', label: 'Alerts', icon: Bell, roles: ['student', 'staff', 'admin'] },
  {
    id: 'subscription',
    label: 'Subscription',
    icon: CreditCard,
    roles: ['student', 'admin'],
  },
  { id: 'help', label: 'Help', icon: HelpCircle, roles: ['student', 'staff', 'admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['student', 'staff', 'admin'] },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    currentUser,
    collegeProfile,
    activeTab,
    setActiveTab,
    notifications,
    settings,
    loginAsDemoRole,
    logout,
  } = useQueueCast();

  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const role: UserRole = currentUser?.role || 'student';
  const visibleSidebarItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  ).map((item) =>
    item.id === 'subscription' && role === 'student'
      ? { ...item, label: 'Why QueueCast' }
      : item
  );

  // Mobile bottom nav: Home, Canteens, Alerts, Dashboard/Staff/Help, More
  const fourthMobileTab: NavItemConfig =
    role === 'admin'
      ? ALL_NAV_ITEMS.find((i) => i.id === 'dashboard')!
      : role === 'staff'
      ? ALL_NAV_ITEMS.find((i) => i.id === 'staff')!
      : ALL_NAV_ITEMS.find((i) => i.id === 'help')!;

  const mobilePrimaryTabs: NavItemConfig[] = [
    ALL_NAV_ITEMS.find((i) => i.id === 'home')!,
    ALL_NAV_ITEMS.find((i) => i.id === 'canteens')!,
    ALL_NAV_ITEMS.find((i) => i.id === 'alerts')!,
    fourthMobileTab,
  ];

  const mobilePrimaryIds = new Set(mobilePrimaryTabs.map((t) => t.id));
  const moreDrawerItems = visibleSidebarItems.filter(
    (item) => !mobilePrimaryIds.has(item.id)
  );

  const unreadAlertsCount = notifications.filter((n) => !n.read).length;

  const isNavActive = (tabId: NavTab) => {
    if (tabId === 'canteens' && activeTab === 'canteen-detail') return true;
    return activeTab === tabId;
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1] text-[#333333] flex flex-col md:flex-row">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-neutral-200 z-30">
        <div className="px-5 py-4 border-b border-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-left focus:outline-none"
          >
            <Logo size="md" />
          </button>
          <p className="text-[11px] text-neutral-500 mt-1.5 truncate">
            {collegeProfile.collegeName}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Primary sidebar">
          {visibleSidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#C00000]/10 text-[#C00000]'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-[#333333]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#C00000] text-white text-[10px] font-mono tabular-nums font-bold">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Demo Switcher & User Card */}
        <div className="p-3 border-t border-neutral-200 bg-[#F9F9F9] space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold text-neutral-500 px-1 mb-1">
              Switch Demo Role
            </p>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-200/70">
              {(['student', 'staff', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => loginAsDemoRole(r)}
                  className={`py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                    role === r
                      ? 'bg-white text-[#C00000] shadow-xs'
                      : 'text-neutral-600 hover:text-[#333333]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#333333] truncate">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-neutral-500 capitalize truncate">
                {role} · {settings.simulationEnabled ? 'Sim ON' : 'Manual'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-[#C0392B] transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Compact Sticky Header (52px) */}
      <header className="md:hidden sticky top-0 z-30 h-[52px] bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="shrink-0"
        >
          <Logo size="sm" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-neutral-500 capitalize truncate">
            {currentUser?.name?.split(' ')[0]} · {role}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className="relative min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100"
            aria-label="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C00000]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ToastBanner />
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (64px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe bg-white/95 backdrop-blur-md border-t border-neutral-200 grid grid-cols-5 items-center"
        aria-label="Mobile navigation"
      >
        {mobilePrimaryTabs.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(item.id) && !moreSheetOpen;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMoreSheetOpen(false);
                setActiveTab(item.id);
              }}
              className={`relative h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-[#C00000]' : 'text-neutral-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
              {item.id === 'alerts' && unreadAlertsCount > 0 && (
                <span className="absolute top-2 right-[28%] w-2 h-2 rounded-full bg-[#C00000]" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreSheetOpen((v) => !v)}
          className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
            moreSheetOpen ? 'text-[#C00000]' : 'text-neutral-500'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer */}
      {moreSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end"
          onClick={() => setMoreSheetOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white p-5 pb-8 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-neutral-300 mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-base text-[#333333]">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-neutral-500 capitalize">
                  {role} · {collegeProfile.collegeName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreSheetOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {moreDrawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMoreSheetOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold text-[#333333] hover:bg-neutral-100"
                  >
                    <Icon className="w-4 h-4 text-[#C00000]" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <p className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Switch Demo Role
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'staff', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      loginAsDemoRole(r);
                      setMoreSheetOpen(false);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-semibold capitalize border ${
                      role === r
                        ? 'border-[#C00000] bg-[#C00000]/10 text-[#C00000]'
                        : 'border-neutral-200 text-neutral-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMoreSheetOpen(false);
                logout();
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#F1F1F1] text-[#C0392B] text-sm font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
