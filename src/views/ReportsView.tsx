import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { QueueBadge } from '../components/QueueBadge';
import { useQueueCast } from '../context/QueueCastContext';
import {
  exportHistoryToCSV,
  formatDateTimeShort,
  formatIndianNumber,
  generateReportInsight,
  getBestTimeToVisit,
  getPeakHour,
  getQueueLevel,
} from '../utils/calculations';

type DateRangeFilter = 'today' | '7days' | 'all';

export const ReportsView: React.FC = () => {
  const { canteens, queueHistory, settings, showToast } = useQueueCast();

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('7days');
  const [canteenFilter, setCanteenFilter] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const sevenDaysAgo = todayStart - 6 * 86400 * 1000;

    return queueHistory.filter((rec) => {
      if (canteenFilter !== 'all' && rec.canteenId !== canteenFilter) {
        return false;
      }
      const ts = new Date(rec.timestamp).getTime();
      if (dateFilter === 'today' && ts < todayStart) return false;
      if (dateFilter === '7days' && ts < sevenDaysAgo) return false;
      return true;
    });
  }, [queueHistory, dateFilter, canteenFilter]);

  const avgWaitFiltered = useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    return Math.round(
      filteredHistory.reduce((sum, r) => sum + r.waitMinutes, 0) /
        filteredHistory.length
    );
  }, [filteredHistory]);

  const busiestOverall = useMemo(
    () => getPeakHour(filteredHistory, canteenFilter, settings.thresholds),
    [filteredHistory, canteenFilter, settings.thresholds]
  );

  const quietestOverall = useMemo(
    () =>
      canteenFilter === 'all'
        ? (() => {
            // Compute lowest non-empty hour across filtered
            const buckets = new Map<number, { sum: number; count: number }>();
            for (const r of filteredHistory) {
              const h = new Date(r.timestamp).getHours();
              if (h < 9 || h > 16) continue;
              const prev = buckets.get(h) || { sum: 0, count: 0 };
              buckets.set(h, { sum: prev.sum + r.waitMinutes, count: prev.count + 1 });
            }
            let bestH = 15;
            let bestAvg = Infinity;
            buckets.forEach((val, hr) => {
              const avg = val.sum / val.count;
              if (avg < bestAvg) {
                bestAvg = avg;
                bestH = hr;
              }
            });
            const label =
              bestH === 12
                ? '12 PM'
                : bestH > 12
                ? `${bestH - 12} PM`
                : `${bestH} AM`;
            return {
              hourLabel: label,
              avgWait: bestAvg === Infinity ? 0 : Math.round(bestAvg),
            };
          })()
        : getBestTimeToVisit(filteredHistory, canteenFilter, settings.thresholds),
    [filteredHistory, canteenFilter, settings.thresholds]
  );

  const insightText = useMemo(
    () => generateReportInsight(filteredHistory, canteens, settings.thresholds),
    [filteredHistory, canteens, settings.thresholds]
  );

  const perCanteenSummary = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    return canteens
      .filter((c) => canteenFilter === 'all' || c.id === canteenFilter)
      .map((c) => {
        const recs = filteredHistory.filter((r) => r.canteenId === c.id);
        const todayRecs = recs.filter(
          (r) => new Date(r.timestamp).getTime() >= todayStart
        );
        const dailyAvg =
          todayRecs.length > 0
            ? Math.round(
                todayRecs.reduce((s, r) => s + r.waitMinutes, 0) /
                  todayRecs.length
              )
            : 0;
        const periodAvg =
          recs.length > 0
            ? Math.round(
                recs.reduce((s, r) => s + r.waitMinutes, 0) / recs.length
              )
            : 0;
        const peak = getPeakHour(recs, c.id, settings.thresholds);
        const quiet = getBestTimeToVisit(recs, c.id, settings.thresholds);
        return {
          canteen: c,
          dailyAvg,
          periodAvg,
          busiest: peak.hasData ? `${peak.hourLabel} (${peak.avgWait}m)` : '—',
          quietest: quiet.hasData ? `${quiet.hourLabel} (${quiet.avgWait}m)` : '—',
          updatesCount: recs.length,
        };
      });
  }, [canteens, filteredHistory, canteenFilter, settings.thresholds]);

  const handleExportCSV = () => {
    const ok = exportHistoryToCSV(filteredHistory, settings.thresholds);
    if (!ok) {
      showToast('No records available to export for the current filters.', 'error');
      return;
    }
    showToast(
      `Exported ${filteredHistory.length} queue records to CSV.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#333333]">
            Analytics & Reports
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Daily & weekly crowd trends calculated from saved queue records
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0" />
          Export Report (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F1F1F1]">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  dateFilter === opt.id
                    ? 'bg-white text-[#C00000] shadow-xs'
                    : 'text-neutral-600 hover:text-[#333333]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <select
          value={canteenFilter}
          onChange={(e) => setCanteenFilter(e.target.value)}
          className="rounded-xl border border-neutral-300 bg-[#F9F9F9] px-3.5 py-2 text-xs font-semibold text-[#333333] focus:outline-none focus:border-[#C00000]"
        >
          <option value="all">All Campus Canteens</option>
          {canteens.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actionable Insight */}
      <div className="rounded-2xl bg-[#F26A2A]/10 border border-[#F26A2A]/30 p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#F26A2A] text-white flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#8F3406]">
            Operational Insight
          </p>
          <p className="text-sm font-medium text-[#333333] mt-0.5 leading-relaxed">
            {insightText}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500">Average Wait (Filtered)</span>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-1">
            {avgWaitFiltered} min
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#C0392B]" />
            Busiest Hour
          </span>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-1">
            {busiestOverall.hourLabel}
          </p>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            ~{busiestOverall.avgWait} min avg
          </span>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[#4CAF7A]" />
            Quietest Hour
          </span>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-1">
            {quietestOverall.hourLabel}
          </p>
          <span className="text-[11px] text-neutral-500 tabular-nums">
            ~{quietestOverall.avgWait} min avg
          </span>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 p-4">
          <span className="text-xs text-neutral-500">Total Updates Recorded</span>
          <p className="font-display text-2xl font-extrabold tabular-nums text-[#333333] mt-1">
            {formatIndianNumber(filteredHistory.length)}
          </p>
        </div>
      </div>

      {/* Per-Canteen Breakdown */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <h2 className="font-display text-base font-bold text-[#333333] mb-4">
          Daily & Weekly Average Wait by Canteen
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2.5 pr-4 font-semibold">Canteen</th>
                <th className="py-2.5 px-3 font-semibold text-right">Today Avg</th>
                <th className="py-2.5 px-3 font-semibold text-right">Selected Period Avg</th>
                <th className="py-2.5 px-3 font-semibold">Busiest Hour</th>
                <th className="py-2.5 px-3 font-semibold">Quietest Hour</th>
                <th className="py-2.5 pl-3 font-semibold text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {perCanteenSummary.map((row) => (
                <tr key={row.canteen.id} className="hover:bg-neutral-50">
                  <td className="py-3 pr-4 font-semibold text-[#333333]">
                    {row.canteen.name}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {row.dailyAvg} min
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                    {row.periodAvg} min
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-[#C0392B]">
                    {row.busiest}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-[#237A4B]">
                    {row.quietest}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums text-neutral-600">
                    {formatIndianNumber(row.updatesCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Queue Log Table */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-display text-base font-bold text-[#333333]">
            Recorded Queue History ({Math.min(25, filteredHistory.length)} most recent)
          </h2>
          <span className="text-xs text-neutral-500">
            Used for CSV export & charts
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-xl bg-[#F9F9F9] border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No queue history records found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2 pr-3 font-semibold">Timestamp</th>
                  <th className="py-2 px-3 font-semibold">Canteen</th>
                  <th className="py-2 px-3 font-semibold text-right">People</th>
                  <th className="py-2 px-3 font-semibold text-right">Counters</th>
                  <th className="py-2 px-3 font-semibold text-right">Wait</th>
                  <th className="py-2 px-3 font-semibold">Level</th>
                  <th className="py-2 pl-3 font-semibold">Source / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredHistory.slice(0, 25).map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 pr-3 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {formatDateTimeShort(rec.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#333333] whitespace-nowrap">
                      {rec.canteenName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {rec.peopleInQueue}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {rec.openCounters}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                      {rec.waitMinutes}m
                    </td>
                    <td className="py-2.5 px-3">
                      <QueueBadge
                        level={getQueueLevel(rec.waitMinutes, settings.thresholds)}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 pl-3 text-neutral-600 max-w-xs truncate">
                      {rec.isSimulated ? 'Simulated · ' : `${rec.updatedBy} · `}
                      {rec.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
