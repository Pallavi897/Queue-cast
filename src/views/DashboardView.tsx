import React, { useMemo, useState } from 'react';
import {
  Bell,
  Clock,
  Flame,
  Plus,
  Radio,
  Store,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { BarChart } from '../components/BarChart';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import {
  calculateWaitMinutes,
  formatDateTimeShort,
  formatIndianNumber,
  getHourlyStats,
  getPeakHour,
  getQueueLevel,
  getWeeklyTrend,
} from '../utils/calculations';

export const DashboardView: React.FC = () => {
  const {
    collegeProfile,
    canteens,
    queueHistory,
    alerts,
    settings,
    setActiveTab,
    openCanteenDetail,
    toggleSimulation,
    addCanteen,
    showToast,
  } = useQueueCast();

  const [chartCanteenId, setChartCanteenId] = useState<string>(
    canteens[0]?.id || 'all'
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newHours, setNewHours] = useState('8:30 AM – 6:00 PM');
  const [newCounters, setNewCounters] = useState(2);
  const [newServiceTime, setNewServiceTime] = useState(
    settings.defaultServiceTimeMin
  );

  // KPIs computed directly from stored collections
  const avgWaitToday = useMemo(() => {
    const now = new Date();
    const todayRecs = queueHistory.filter((rec) => {
      const d = new Date(rec.timestamp);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
    if (todayRecs.length === 0) {
      if (canteens.length === 0) return 0;
      const sum = canteens.reduce(
        (acc, c) =>
          acc +
          calculateWaitMinutes(
            c.peopleInQueue,
            c.avgServiceTimeMin,
            c.openCounters
          ),
        0
      );
      return Math.round(sum / canteens.length);
    }
    return Math.round(
      todayRecs.reduce((sum, r) => sum + r.waitMinutes, 0) / todayRecs.length
    );
  }, [queueHistory, canteens]);

  const peakToday = useMemo(
    () => getPeakHour(queueHistory, 'all', settings.thresholds),
    [queueHistory, settings.thresholds]
  );

  const activeAlertsCount = alerts.filter((a) => a.active).length;

  const hourlyStats = useMemo(
    () =>
      getHourlyStats(queueHistory, chartCanteenId, settings.thresholds, false),
    [queueHistory, chartCanteenId, settings.thresholds]
  );

  const weeklyTrend = useMemo(
    () => getWeeklyTrend(queueHistory, 'all', settings.thresholds),
    [queueHistory, settings.thresholds]
  );

  const recentUpdates = useMemo(() => queueHistory.slice(0, 7), [queueHistory]);

  const handleQuickAddCanteen = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addCanteen({
      name: newName,
      location: newLocation,
      openingHours: newHours,
      openCounters: Number(newCounters),
      avgServiceTimeMin: Number(newServiceTime),
    });
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
    setNewName('');
    setNewLocation('');
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#333333]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {collegeProfile.collegeName} · Live analytics from saved queue history
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleSimulation()}
            className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
              settings.simulationEnabled
                ? 'bg-[#F26A2A]/12 border-[#F26A2A] text-[#8F3406]'
                : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            {settings.simulationEnabled ? 'Simulation ON' : 'Simulate Live Data'}
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl bg-[#C00000] text-white text-xs font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Canteen
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[42px] rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-[#333333] hover:border-[#C00000] hover:text-[#C00000] transition-colors whitespace-nowrap"
          >
            <Utensils className="w-3.5 h-3.5" />
            Update Queue / Menu
          </button>
        </div>
      </div>

      {/* Simulation Banner */}
      {settings.simulationEnabled && (
        <div className="rounded-2xl bg-[#F26A2A]/10 border border-[#F26A2A]/35 px-4 py-3 text-xs font-medium text-[#8F3406] flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#F26A2A] shrink-0" />
          <span>
            Simulated data, no sensors connected — queue levels update automatically every 7 seconds.
          </span>
        </div>
      )}

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total Canteens</span>
            <Store className="w-4 h-4 text-[#C00000]" />
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-2">
            {canteens.length}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {canteens.filter((c) => c.isOpen).length} open right now
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Avg Wait Today</span>
            <Clock className="w-4 h-4 text-[#F26A2A]" />
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-2">
            {avgWaitToday} min
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Across recorded updates
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Peak Hour Today</span>
            <Flame className="w-4 h-4 text-[#C0392B]" />
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-2">
            {peakToday.hourLabel}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5 tabular-nums">
            Avg {peakToday.avgWait} min wait
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Registered Students</span>
            <Users className="w-4 h-4 text-[#4CAF7A]" />
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-2">
            {formatIndianNumber(collegeProfile.studentCount)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {collegeProfile.city} campus
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-neutral-200 p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Active Alerts</span>
            <Bell className="w-4 h-4 text-[#E5A100]" />
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-2">
            {activeAlertsCount}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            In-app wait triggers
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#333333]">
                Hourly Average Wait (9 AM – 4 PM)
              </h2>
              <p className="text-xs text-neutral-500">
                Computed from saved queue history records
              </p>
            </div>
            <select
              value={chartCanteenId}
              onChange={(e) => setChartCanteenId(e.target.value)}
              className="rounded-xl border border-neutral-300 bg-[#F9F9F9] px-3 py-1.5 text-xs font-semibold text-[#333333] focus:outline-none focus:border-[#C00000]"
            >
              <option value="all">All Canteens Combined</option>
              {canteens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <BarChart
            data={hourlyStats.map((h) => ({
              label: h.label,
              value: h.avgWait,
              level: h.level,
              sublabel: `${h.count} logs`,
            }))}
            height={200}
          />
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-white border border-neutral-200 p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-[#333333]">
              Weekly Crowd Trend (Last 7 Days)
            </h2>
            <p className="text-xs text-neutral-500">
              Daily average wait across all campus canteens
            </p>
          </div>

          <BarChart
            data={weeklyTrend.map((d) => ({
              label: d.dayLabel,
              value: d.avgWait,
              level: d.level,
              sublabel: `${d.updatesCount} records`,
            }))}
            height={200}
          />
        </div>
      </div>

      {/* Canteen Comparison Table + Recent Staff Updates */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-2xl bg-white border border-neutral-200 p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-base font-bold text-[#333333]">
              Canteen Comparison
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-[#C00000] hover:underline"
            >
              Full Analytics & CSV →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                  <th className="py-2.5 pr-3 font-semibold">Canteen</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Crowd</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Counters</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Wait</th>
                  <th className="py-2.5 pl-3 font-semibold">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {canteens.map((c) => {
                  const wait = calculateWaitMinutes(
                    c.peopleInQueue,
                    c.avgServiceTimeMin,
                    c.openCounters
                  );
                  const level = getQueueLevel(wait, settings.thresholds);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openCanteenDetail(c.id)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-3 font-semibold text-[#333333]">
                        {c.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {c.peopleInQueue}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {c.openCounters}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-[#333333]">
                        {c.isOpen ? `${wait}m` : 'Closed'}
                      </td>
                      <td className="py-3 pl-3">
                        <QueueBadge level={level} isOpen={c.isOpen} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-5 rounded-2xl bg-white border border-neutral-200 p-6">
          <h2 className="font-display text-base font-bold text-[#333333] mb-4">
            Recent Queue Updates
          </h2>
          <div className="divide-y divide-neutral-100">
            {recentUpdates.map((rec) => (
              <div
                key={rec.id}
                className="py-2.5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#333333] truncate">
                    {rec.canteenName} ·{' '}
                    <span className="font-mono tabular-nums">
                      {rec.waitMinutes} min
                    </span>
                  </p>
                  <p className="text-neutral-500 truncate mt-0.5">
                    {rec.note || 'Queue update'} · {rec.isSimulated ? 'Simulated' : rec.updatedBy}
                  </p>
                </div>
                <span className="text-neutral-400 font-mono tabular-nums whitespace-nowrap shrink-0">
                  {formatDateTimeShort(rec.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Canteen Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#333333]">
                Add Campus Canteen
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCanteen} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Canteen Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. MBA Block Cafe"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Ground Floor · Management Block"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  required
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm focus:outline-none focus:border-[#C00000]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Open Counters
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newCounters}
                    onChange={(e) => setNewCounters(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Avg Service (min)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    required
                    value={newServiceTime}
                    onChange={(e) => setNewServiceTime(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm tabular-nums focus:outline-none focus:border-[#C00000]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621]"
                >
                  Save Canteen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
