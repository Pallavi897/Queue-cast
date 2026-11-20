import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Clock,
  Heart,
  MapPin,
  Sparkles,
  Store,
  Users,
  Utensils,
} from 'lucide-react';
import { BarChart } from '../components/BarChart';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import {
  calculateWaitMinutes,
  formatINR,
  formatTimeShort,
  getBestTimeToVisit,
  getHourlyStats,
  getQueueLevel,
} from '../utils/calculations';

export const CanteenDetailView: React.FC = () => {
  const {
    currentUser,
    selectedCanteenId,
    canteens,
    queueHistory,
    menuItems,
    favourites,
    settings,
    setActiveTab,
    toggleFavourite,
    addAlert,
    showToast,
  } = useQueueCast();

  const canteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0];

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState<number>(8);
  const [menuCategory, setMenuCategory] = useState<
    'All' | 'Meals' | 'Snacks' | 'Beverages'
  >('All');

  const hourlyStats = useMemo(() => {
    if (!canteen) return [];
    return getHourlyStats(queueHistory, canteen.id, settings.thresholds, false);
  }, [queueHistory, canteen, settings.thresholds]);

  const bestTime = useMemo(() => {
    if (!canteen) return { hourLabel: '3 PM', avgWait: 4, hasData: false };
    return getBestTimeToVisit(queueHistory, canteen.id, settings.thresholds);
  }, [queueHistory, canteen, settings.thresholds]);

  const canteenMenu = useMemo(() => {
    if (!canteen) return [];
    return menuItems.filter(
      (m) =>
        m.canteenId === canteen.id &&
        (menuCategory === 'All' || m.category === menuCategory)
    );
  }, [menuItems, canteen, menuCategory]);

  if (!canteen) {
    return (
      <div className="rounded-2xl bg-white border border-neutral-200 p-8 text-center">
        <p className="font-display text-lg font-bold text-[#333333]">
          No canteen selected
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('canteens')}
          className="mt-4 px-4 py-2 rounded-xl bg-[#C00000] text-white text-sm font-semibold"
        >
          Back to All Canteens
        </button>
      </div>
    );
  }

  const waitMinutes = calculateWaitMinutes(
    canteen.peopleInQueue,
    canteen.avgServiceTimeMin,
    canteen.openCounters
  );
  const queueLevel = getQueueLevel(waitMinutes, settings.thresholds);
  const isFav = favourites.includes(canteen.id);
  const isStaffOrAdmin =
    currentUser?.role === 'staff' || currentUser?.role === 'admin';

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addAlert(canteen.id, Number(alertThreshold));
    if (res.ok) {
      showToast(res.message, 'success');
      setAlertOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('canteens')}
          className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-xl bg-white border border-neutral-200 text-sm font-semibold text-[#333333] hover:border-[#C00000] hover:text-[#C00000] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Canteens
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleFavourite(canteen.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
              isFav
                ? 'bg-[#C00000]/10 border-[#C00000] text-[#C00000]'
                : 'bg-white border-neutral-200 text-[#333333] hover:border-[#C00000]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#C00000]' : ''}`} />
            {isFav ? 'Saved to Favourites' : 'Add to Favourites'}
          </button>

          <button
            type="button"
            onClick={() => setAlertOpen((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
          >
            <Bell className="w-4 h-4" />
            Set Alert
          </button>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-xl bg-[#F26A2A] text-white text-sm font-semibold hover:bg-[#d85719] transition-colors whitespace-nowrap"
            >
              Update Queue
            </button>
          )}
        </div>
      </div>

      {/* Inline Alert Creator */}
      {alertOpen && (
        <form
          onSubmit={handleCreateAlert}
          className="rounded-2xl bg-white border border-[#C00000]/30 p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shadow-sm"
        >
          <div className="flex-1">
            <h3 className="font-display text-sm font-bold text-[#333333]">
              Notify me when wait at {canteen.name} drops under:
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              In-app notification banner only (prototype demo — no SMS or push sent).
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                required
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-20 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
              />
              <span className="text-sm text-neutral-600">min</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 min-h-[40px] rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] whitespace-nowrap"
            >
              Save Alert
            </button>
            <button
              type="button"
              onClick={() => setAlertOpen(false)}
              className="px-3 py-2 min-h-[40px] rounded-xl bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Hero Wait Card + Best Time Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#333333]">
                {canteen.name}
              </h1>
              <p className="text-sm text-neutral-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {canteen.location}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {canteen.openingHours}
                </span>
              </p>
            </div>
            <QueueBadge level={queueLevel} isOpen={canteen.isOpen} />
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            <div>
              <span className="block text-xs font-semibold text-neutral-500">
                Estimated wait right now
              </span>
              <span className="font-display text-5xl font-extrabold tabular-nums text-[#333333] block mt-1">
                {canteen.isOpen ? `${waitMinutes} min` : 'Closed'}
              </span>
              <span className="block text-xs text-neutral-500 mt-2 font-mono tabular-nums">
                ({canteen.peopleInQueue} people × {canteen.avgServiceTimeMin} min) ÷{' '}
                {canteen.openCounters} counters
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-3.5">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#C00000]" />
                  In Queue
                </span>
                <span className="font-display text-2xl font-bold tabular-nums text-[#333333] block mt-1">
                  {canteen.peopleInQueue}
                </span>
              </div>

              <div className="rounded-xl bg-[#F9F9F9] border border-neutral-200 p-3.5">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#F26A2A]" />
                  Open Counters
                </span>
                <span className="font-display text-2xl font-bold tabular-nums text-[#333333] block mt-1">
                  {canteen.openCounters}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
            <span>
              Last updated {formatTimeShort(canteen.lastUpdated)} by {canteen.updatedBy}
              {canteen.isSimulatedData ? ' (Simulated data)' : ''}
            </span>
            {canteen.lastNote && (
              <span className="font-medium text-[#333333]">
                Staff note: &ldquo;{canteen.lastNote}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* Best Time & Quick Info */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#237A4B]">
              <Sparkles className="w-4 h-4" />
              Best Time to Visit
            </div>
            <h2 className="font-display text-2xl font-bold text-[#333333] mt-2">
              {bestTime.hourLabel}, expect ~{bestTime.avgWait} min
            </h2>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              Calculated directly from saved queue history between 9 AM and 4 PM. Visiting around{' '}
              <strong>{bestTime.hourLabel}</strong> historically gives you the shortest counter wait.
            </p>
          </div>

          <div className="mt-6 rounded-xl bg-[#F9F9F9] border border-neutral-200 p-4 space-y-2 text-xs text-neutral-600">
            <div className="flex items-center justify-between">
              <span>Low queue threshold</span>
              <span className="font-mono tabular-nums font-semibold text-[#237A4B]">
                Under {settings.thresholds.lowMaxMinutes} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Medium queue threshold</span>
              <span className="font-mono tabular-nums font-semibold text-[#9B6B00]">
                {settings.thresholds.lowMaxMinutes}–{settings.thresholds.mediumMaxMinutes} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>High queue threshold</span>
              <span className="font-mono tabular-nums font-semibold text-[#C0392B]">
                Above {settings.thresholds.mediumMaxMinutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Chart (9 AM to 4 PM) */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-[#333333]">
              Peak Hours Today (9 AM – 4 PM)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Average wait in minutes by hour from saved queue records
            </p>
          </div>
        </div>

        <BarChart
          data={hourlyStats.map((b) => ({
            label: b.label,
            value: b.avgWait,
            level: b.level,
            sublabel: `${b.count} records`,
          }))}
          height={210}
        />
      </div>

      {/* Today's Menu */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Utensils className="w-5 h-5 text-[#C00000]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[#333333]">
                Today&apos;s Menu
              </h2>
              <p className="text-xs text-neutral-500">
                Live item availability updated by canteen staff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F1F1]">
            {(['All', 'Meals', 'Snacks', 'Beverages'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setMenuCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  menuCategory === cat
                    ? 'bg-white text-[#C00000] shadow-xs'
                    : 'text-neutral-600 hover:text-[#333333]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {canteenMenu.length === 0 ? (
          <div className="rounded-xl bg-[#F9F9F9] border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No menu items listed for this category yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {canteenMenu.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      item.available
                        ? 'text-[#333333]'
                        : 'text-neutral-400 line-through'
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.category}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-sm font-bold tabular-nums text-[#333333]">
                    {formatINR(item.price)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      item.available
                        ? 'bg-[#4CAF7A]/12 text-[#237A4B]'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {item.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
