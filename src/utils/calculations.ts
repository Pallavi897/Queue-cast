import {
  Canteen,
  QueueHistoryRecord,
  QueueLevel,
  QueueThresholds,
} from '../types/queuecast';

/**
 * Core Wait Time Formula:
 * Estimated Wait (min) = (People in Queue × Average Service Time per Person in minutes) ÷ Number of Open Counters
 */
export function calculateWaitMinutes(
  peopleInQueue: number,
  avgServiceTimeMin: number,
  openCounters: number
): number {
  const safePeople = Math.max(0, Number.isFinite(peopleInQueue) ? peopleInQueue : 0);
  const safeService = Math.max(0.1, Number.isFinite(avgServiceTimeMin) ? avgServiceTimeMin : 1);
  const safeCounters = Math.max(1, Math.floor(Number.isFinite(openCounters) ? openCounters : 1));
  return Math.round((safePeople * safeService) / safeCounters);
}

export function getQueueLevel(
  waitMinutes: number,
  thresholds: QueueThresholds
): QueueLevel {
  if (waitMinutes < thresholds.lowMaxMinutes) {
    return 'Low';
  }
  if (waitMinutes <= thresholds.mediumMaxMinutes) {
    return 'Medium';
  }
  return 'High';
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatTimeShort(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTimeShort(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatHourLabel(hour24: number): string {
  if (hour24 === 0) return '12 AM';
  if (hour24 < 12) return `${hour24} AM`;
  if (hour24 === 12) return '12 PM';
  return `${hour24 - 12} PM`;
}

export interface HourlyBucket {
  hour: number;
  label: string;
  avgWait: number;
  count: number;
  level: QueueLevel;
}

export function getHourlyStats(
  history: QueueHistoryRecord[],
  canteenId: string | 'all',
  thresholds: QueueThresholds,
  onlyToday = false
): HourlyBucket[] {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const filtered = history.filter((rec) => {
    if (canteenId !== 'all' && rec.canteenId !== canteenId) return false;
    if (onlyToday) {
      const d = new Date(rec.timestamp);
      const recKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (recKey !== todayKey) return false;
    }
    return true;
  });

  // Campus hours 9 AM to 4 PM (9..16)
  const hours = [9, 10, 11, 12, 13, 14, 15, 16];
  return hours.map((hour) => {
    const recordsForHour = filtered.filter((rec) => {
      const d = new Date(rec.timestamp);
      return d.getHours() === hour;
    });
    const avgWait =
      recordsForHour.length > 0
        ? Math.round(
            recordsForHour.reduce((sum, r) => sum + r.waitMinutes, 0) /
              recordsForHour.length
          )
        : 0;
    return {
      hour,
      label: formatHourLabel(hour),
      avgWait,
      count: recordsForHour.length,
      level: getQueueLevel(avgWait, thresholds),
    };
  });
}

export function getBestTimeToVisit(
  history: QueueHistoryRecord[],
  canteenId: string,
  thresholds: QueueThresholds
): { hourLabel: string; avgWait: number; hasData: boolean } {
  const hourly = getHourlyStats(history, canteenId, thresholds, false).filter(
    (b) => b.count > 0
  );
  if (hourly.length === 0) {
    return { hourLabel: '3 PM', avgWait: 4, hasData: false };
  }
  const best = hourly.reduce((min, cur) =>
    cur.avgWait < min.avgWait ? cur : min
  );
  return {
    hourLabel: best.label,
    avgWait: best.avgWait,
    hasData: true,
  };
}

export function getPeakHour(
  history: QueueHistoryRecord[],
  canteenId: string | 'all',
  thresholds: QueueThresholds
): { hourLabel: string; avgWait: number; hasData: boolean } {
  const hourly = getHourlyStats(history, canteenId, thresholds, false).filter(
    (b) => b.count > 0
  );
  if (hourly.length === 0) {
    return { hourLabel: '1 PM', avgWait: 0, hasData: false };
  }
  const peak = hourly.reduce((max, cur) =>
    cur.avgWait > max.avgWait ? cur : max
  );
  return {
    hourLabel: peak.label,
    avgWait: peak.avgWait,
    hasData: true,
  };
}

export interface DailyBucket {
  dayLabel: string;
  dateKey: string;
  avgWait: number;
  updatesCount: number;
  level: QueueLevel;
}

export function getWeeklyTrend(
  history: QueueHistoryRecord[],
  canteenId: string | 'all',
  thresholds: QueueThresholds
): DailyBucket[] {
  const filtered =
    canteenId === 'all'
      ? history
      : history.filter((r) => r.canteenId === canteenId);

  const days: DailyBucket[] = [];
  const now = new Date();
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });

    const dayRecs = filtered.filter((rec) => {
      const rd = new Date(rec.timestamp);
      const rKey = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(rd.getDate()).padStart(2, '0')}`;
      return rKey === key;
    });

    const avgWait =
      dayRecs.length > 0
        ? Math.round(
            dayRecs.reduce((sum, r) => sum + r.waitMinutes, 0) / dayRecs.length
          )
        : 0;

    days.push({
      dayLabel: offset === 0 ? 'Today' : label,
      dateKey: key,
      avgWait,
      updatesCount: dayRecs.length,
      level: getQueueLevel(avgWait, thresholds),
    });
  }
  return days;
}

export function generateReportInsight(
  history: QueueHistoryRecord[],
  canteens: Canteen[],
  thresholds: QueueThresholds
): string {
  if (history.length === 0 || canteens.length === 0) {
    return 'Record queue updates from the Staff Panel to generate peak-hour staffing recommendations.';
  }

  let busiestCanteen = canteens[0];
  let highestPeakWait = -1;
  let busiestHourLabel = '1 PM';

  for (const canteen of canteens) {
    const peak = getPeakHour(history, canteen.id, thresholds);
    if (peak.hasData && peak.avgWait > highestPeakWait) {
      highestPeakWait = peak.avgWait;
      busiestCanteen = canteen;
      busiestHourLabel = peak.hourLabel;
    }
  }

  const best = getBestTimeToVisit(history, busiestCanteen.id, thresholds);

  if (highestPeakWait > thresholds.mediumMaxMinutes) {
    return `${busiestCanteen.name} is busiest around ${busiestHourLabel} (avg ${highestPeakWait} min wait). Suggest opening 1 additional counter between 12 PM and 2 PM, or encouraging students to visit near ${best.hourLabel} (~${best.avgWait} min).`;
  }

  return `${busiestCanteen.name} peaks at ${busiestHourLabel} (avg ${Math.max(
    0,
    highestPeakWait
  )} min wait), while ${best.hourLabel} remains the quietest window (~${best.avgWait} min). Current counter allocation is keeping queues manageable.`;
}

export function exportHistoryToCSV(
  history: QueueHistoryRecord[],
  thresholds: QueueThresholds
): boolean {
  if (history.length === 0) return false;

  const headers = [
    'Record ID',
    'Timestamp',
    'Canteen',
    'People in Queue',
    'Service Time (min/person)',
    'Open Counters',
    'Calculated Wait (min)',
    'Queue Level',
    'Data Source',
    'Updated By',
    'Note',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = history.map((rec) => [
    rec.id,
    new Date(rec.timestamp).toLocaleString('en-IN'),
    rec.canteenName,
    rec.peopleInQueue,
    rec.avgServiceTimeMin,
    rec.openCounters,
    rec.waitMinutes,
    getQueueLevel(rec.waitMinutes, thresholds),
    rec.isSimulated ? 'Simulated' : 'Staff Manual',
    rec.updatedBy,
    rec.note || '',
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n') + '\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute('download', `queuecast-report-${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
