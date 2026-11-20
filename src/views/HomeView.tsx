import React from 'react';
import {
  ArrowRight,
  Bell,
  Clock,
  Heart,
  Radio,
  Sparkles,
  TrendingDown,
  UtensilsCrossed,
} from 'lucide-react';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import {
  calculateWaitMinutes,
  formatIndianNumber,
  formatTimeShort,
  getBestTimeToVisit,
  getQueueLevel,
} from '../utils/calculations';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    collegeProfile,
    canteens,
    queueHistory,
    alerts,
    favourites,
    settings,
    setActiveTab,
    openCanteenDetail,
    toggleSimulation,
  } = useQueueCast();

  const isAdminOrStaff =
    currentUser?.role === 'admin' || currentUser?.role === 'staff';

  const openCanteens = canteens.filter((c) => c.isOpen);
  const fastestCanteen =
    openCanteens.length > 0
      ? openCanteens.reduce((best, cur) => {
          const bestWait = calculateWaitMinutes(
            best.peopleInQueue,
            best.avgServiceTimeMin,
            best.openCounters
          );
          const curWait = calculateWaitMinutes(
            cur.peopleInQueue,
            cur.avgServiceTimeMin,
            cur.openCounters
          );
          return curWait < bestWait ? cur : best;
        })
      : canteens[0];

  const favouriteCanteens = canteens.filter((c) => favourites.includes(c.id));
  const activeAlerts = alerts.filter((a) => a.active);

  const fastestWait = fastestCanteen
    ? calculateWaitMinutes(
        fastestCanteen.peopleInQueue,
        fastestCanteen.avgServiceTimeMin,
        fastestCanteen.openCounters
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Greeting Card */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#C00000]">
            {collegeProfile.collegeName} · {collegeProfile.city}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#333333] mt-1">
            Hello, {currentUser?.name || 'Student'}
          </h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            {currentUser?.role === 'staff'
              ? 'Update live queue counts and menu item availability in seconds from the Staff Panel.'
              : currentUser?.role === 'admin'
              ? 'Monitor campus-wide canteen queues, peak-hour demand, and downloadable reports.'
              : 'Know the queue before you walk over. Pick the fastest canteen or set an in-app wait alert.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isAdminOrStaff && (
            <button
              type="button"
              onClick={() => toggleSimulation()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
                settings.simulationEnabled
                  ? 'bg-[#F26A2A]/12 border-[#F26A2A] text-[#B8450B]'
                  : 'bg-[#F9F9F9] border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              {settings.simulationEnabled ? 'Simulation ON' : 'Simulate Live Data'}
            </button>
          )}

          {currentUser?.role === 'staff' ? (
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
            >
              Open Staff Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : currentUser?.role === 'admin' ? (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
            >
              Open Admin Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('canteens')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
            >
              Browse All Canteens
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Simulation Notice when ON */}
      {settings.simulationEnabled && (
        <div className="rounded-2xl bg-[#F26A2A]/10 border border-[#F26A2A]/35 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#8F3406]">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#F26A2A] shrink-0" />
            <span>
              <strong>Simulated data, no sensors connected:</strong> Queue counts auto-update every ~7 seconds following campus rush patterns.
            </span>
          </div>
          {isAdminOrStaff && (
            <button
              type="button"
              onClick={() => toggleSimulation(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#F26A2A]/40 text-xs font-semibold text-[#8F3406] hover:bg-[#F26A2A]/10 transition-colors whitespace-nowrap"
            >
              Turn Off Simulation
            </button>
          )}
        </div>
      )}

      {/* Fastest Recommendation + Stats Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {fastestCanteen && (
          <div className="lg:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#237A4B]">
                  <TrendingDown className="w-4 h-4" />
                  Shortest Wait Right Now
                </span>
                <QueueBadge
                  level={getQueueLevel(fastestWait, settings.thresholds)}
                  isOpen={fastestCanteen.isOpen}
                  size="sm"
                />
              </div>

              <h2 className="font-display text-xl font-bold text-[#333333] mt-2">
                {fastestCanteen.name}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {fastestCanteen.location} · {fastestCanteen.openingHours}
              </p>

              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <span className="font-display text-4xl font-extrabold tabular-nums text-[#333333]">
                    {fastestCanteen.isOpen ? `${fastestWait} min` : 'Closed'}
                  </span>
                  <span className="block text-xs text-neutral-500 mt-1 tabular-nums">
                    {fastestCanteen.peopleInQueue} people · {fastestCanteen.openCounters} open counters
                  </span>
                </div>
                <div className="text-xs text-neutral-600 bg-[#F9F9F9] rounded-xl px-3.5 py-2.5 border border-neutral-200">
                  Best daily window:{' '}
                  <strong className="text-[#333333]">
                    {
                      getBestTimeToVisit(
                        queueHistory,
                        fastestCanteen.id,
                        settings.thresholds
                      ).hourLabel
                    }
                  </strong>{' '}
                  (~
                  {
                    getBestTimeToVisit(
                      queueHistory,
                      fastestCanteen.id,
                      settings.thresholds
                    ).avgWait
                  }{' '}
                  min avg)
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-neutral-500">
                Updated {formatTimeShort(fastestCanteen.lastUpdated)}
                {fastestCanteen.lastNote ? ` · "${fastestCanteen.lastNote}"` : ''}
              </span>
              <button
                type="button"
                onClick={() => openCanteenDetail(fastestCanteen.id)}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
              >
                View Menu & Hourly Chart
              </button>
            </div>
          </div>
        )}

        {/* Quick Summary Tiles */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('canteens')}
            className="text-left rounded-2xl bg-white border border-neutral-200 p-5 hover:border-[#C00000]/40 transition-colors flex flex-col justify-between"
          >
            <UtensilsCrossed className="w-5 h-5 text-[#C00000]" />
            <div className="mt-4">
              <span className="font-display text-2xl font-bold tabular-nums text-[#333333]">
                {openCanteens.length}/{canteens.length}
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Canteens Open Now
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className="text-left rounded-2xl bg-white border border-neutral-200 p-5 hover:border-[#C00000]/40 transition-colors flex flex-col justify-between"
          >
            <Bell className="w-5 h-5 text-[#F26A2A]" />
            <div className="mt-4">
              <span className="font-display text-2xl font-bold tabular-nums text-[#333333]">
                {activeAlerts.length}
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Active Wait Alerts
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('canteens')}
            className="text-left rounded-2xl bg-white border border-neutral-200 p-5 hover:border-[#C00000]/40 transition-colors flex flex-col justify-between"
          >
            <Heart className="w-5 h-5 text-[#A31621]" />
            <div className="mt-4">
              <span className="font-display text-2xl font-bold tabular-nums text-[#333333]">
                {favourites.length}
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Favourite Canteens
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('help')}
            className="text-left rounded-2xl bg-white border border-neutral-200 p-5 hover:border-[#C00000]/40 transition-colors flex flex-col justify-between"
          >
            <Sparkles className="w-5 h-5 text-[#4CAF7A]" />
            <div className="mt-4">
              <span className="font-display text-base font-bold text-[#333333]">
                QueueCast Help
              </span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                Ask QueueCast Assistant
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Favourite Canteens Quick Access */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#333333]">
              Your Favourite Canteens
            </h2>
            <p className="text-xs text-neutral-500">
              Star any canteen from the directory to track it right here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('canteens')}
            className="text-xs font-semibold text-[#C00000] hover:underline whitespace-nowrap"
          >
            All Canteens →
          </button>
        </div>

        {favouriteCanteens.length === 0 ? (
          <div className="rounded-xl bg-[#F9F9F9] border border-dashed border-neutral-200 p-6 text-center">
            <p className="text-sm text-neutral-600">
              You haven&apos;t pinned any favourite canteens yet.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('canteens')}
              className="mt-3 px-4 py-2 rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors"
            >
              Explore Canteens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favouriteCanteens.map((canteen) => {
              const wait = calculateWaitMinutes(
                canteen.peopleInQueue,
                canteen.avgServiceTimeMin,
                canteen.openCounters
              );
              const level = getQueueLevel(wait, settings.thresholds);

              return (
                <button
                  key={canteen.id}
                  type="button"
                  onClick={() => openCanteenDetail(canteen.id)}
                  className="text-left rounded-xl border border-neutral-200 bg-[#F9F9F9] p-4 hover:border-[#C00000]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display font-bold text-sm text-[#333333] truncate">
                      {canteen.name}
                    </span>
                    <QueueBadge level={level} isOpen={canteen.isOpen} size="sm" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold tabular-nums text-[#333333]">
                      {canteen.isOpen ? `${wait} min` : 'Closed'}
                    </span>
                    <span className="text-xs text-neutral-500 flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {canteen.peopleInQueue} in line
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Campus Footer Info */}
      <div className="rounded-2xl bg-white border border-neutral-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <span>
          Serving {formatIndianNumber(collegeProfile.studentCount)} students across{' '}
          {canteens.length} campus canteens · Sample/simulated queue prototype
        </span>
        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className="font-semibold text-[#C00000] hover:underline"
        >
          Why QueueCast & Campus Pricing →
        </button>
      </div>
    </div>
  );
};
