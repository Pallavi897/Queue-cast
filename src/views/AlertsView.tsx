import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Edit3,
  Info,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useQueueCast } from '../context/QueueCastContext';
import { QueueAlert } from '../types/queuecast';
import {
  calculateWaitMinutes,
  formatDateTimeShort,
} from '../utils/calculations';

export const AlertsView: React.FC = () => {
  const {
    canteens,
    alerts,
    notifications,
    addAlert,
    editAlert,
    toggleAlert,
    deleteAlert,
    markAllNotificationsRead,
    openCanteenDetail,
    showToast,
  } = useQueueCast();

  const [selectedCanteenId, setSelectedCanteenId] = useState<string>(
    canteens[0]?.id || ''
  );
  const [thresholdMinutes, setThresholdMinutes] = useState<number>(8);

  const [editingAlert, setEditingAlert] = useState<QueueAlert | null>(null);
  const [editThreshold, setEditThreshold] = useState<number>(8);
  const [alertToDelete, setAlertToDelete] = useState<QueueAlert | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addAlert(selectedCanteenId, Number(thresholdMinutes));
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
  };

  const handleSaveEdit = (alertId: string) => {
    const res = editAlert(alertId, Number(editThreshold));
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
    setEditingAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#333333]">
          Queue Drop Alerts
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Get notified inside the app when a canteen&apos;s wait falls below your target minutes
        </p>
      </div>

      {/* Explicit In-App Only Notice */}
      <div className="rounded-2xl bg-[#F26A2A]/10 border border-[#F26A2A]/30 px-4 py-3.5 flex items-start gap-3 text-sm text-[#8F3406]">
        <Info className="w-4 h-4 text-[#F26A2A] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">In-app notifications only:</span>{' '}
          Alerts appear as banners inside QueueCast when staff or simulation updates bring the wait below your threshold. No SMS or push notifications are sent.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Create Alert Form */}
        <form
          onSubmit={handleCreate}
          className="lg:col-span-5 rounded-2xl bg-white border border-neutral-200 p-6 space-y-4 self-start"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C00000]" />
            <h2 className="font-display text-base font-bold text-[#333333]">
              Create Wait Alert
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Select Canteen
            </label>
            <select
              value={selectedCanteenId}
              onChange={(e) => setSelectedCanteenId(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C00000]"
            >
              {canteens.map((c) => {
                const w = calculateWaitMinutes(
                  c.peopleInQueue,
                  c.avgServiceTimeMin,
                  c.openCounters
                );
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} (currently {c.isOpen ? `${w} min` : 'Closed'})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notify me when wait is under (minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                required
                value={thresholdMinutes}
                onChange={(e) => setThresholdMinutes(Number(e.target.value))}
                className="w-28 rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-mono tabular-nums focus:outline-none focus:border-[#C00000]"
              />
              <span className="text-sm text-neutral-500">minutes</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[5, 8, 10, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setThresholdMinutes(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    thresholdMinutes === preset
                      ? 'bg-[#C00000] text-white'
                      : 'bg-[#F1F1F1] text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Under {preset}m
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Save In-App Alert
          </button>
        </form>

        {/* Active Alerts List */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <h2 className="font-display text-base font-bold text-[#333333] mb-4">
              Saved Alert Rules ({alerts.length})
            </h2>

            {alerts.length === 0 ? (
              <div className="rounded-xl bg-[#F9F9F9] border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                No alerts set yet. Add a rule on the left to watch any canteen.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {alerts.map((alert) => {
                  const canteen = canteens.find((c) => c.id === alert.canteenId);
                  const currentWait = canteen
                    ? calculateWaitMinutes(
                        canteen.peopleInQueue,
                        canteen.avgServiceTimeMin,
                        canteen.openCounters
                      )
                    : 0;
                  const isEditing = editingAlert?.id === alert.id;

                  return (
                    <div
                      key={alert.id}
                      className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#333333]">
                          {canteen?.name || 'Unknown Canteen'}
                        </p>
                        {isEditing ? (
                          <div className="mt-1.5 flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={editThreshold}
                              onChange={(e) =>
                                setEditThreshold(Number(e.target.value))
                              }
                              className="w-20 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-mono tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(alert.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#C00000] text-white text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAlert(null)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Notify when under{' '}
                            <strong className="font-mono tabular-nums text-[#333333]">
                              {alert.thresholdMinutes} min
                            </strong>{' '}
                            · Current wait:{' '}
                            <span className="font-mono tabular-nums">
                              {canteen?.isOpen ? `${currentWait} min` : 'Closed'}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleAlert(alert.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
                            alert.active
                              ? 'bg-[#4CAF7A]/15 text-[#237A4B] hover:bg-[#4CAF7A]/25'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {alert.active ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Paused
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingAlert(alert);
                            setEditThreshold(alert.thresholdMinutes);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#333333]"
                          aria-label="Edit alert threshold"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAlertToDelete(alert)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-[#C0392B]/10 hover:text-[#C0392B]"
                          aria-label="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Triggered In-App Notifications History */}
          <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-display text-base font-bold text-[#333333]">
                Triggered In-App Alerts ({notifications.length})
              </h2>
              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C00000] hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No alerts have fired yet. When a canteen&apos;s wait drops under your threshold (via Staff Update or Simulation), it will appear here and as an in-app banner.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#333333]">{n.message}</p>
                      <p className="text-neutral-400 mt-0.5 font-mono tabular-nums">
                        {formatDateTimeShort(n.timestamp)} · In-app alert
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCanteenDetail(n.canteenId)}
                      className="px-3 py-1.5 rounded-lg bg-[#F1F1F1] text-[#333333] font-semibold hover:bg-neutral-200 whitespace-nowrap shrink-0"
                    >
                      Open Canteen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(alertToDelete)}
        title="Delete Alert Rule?"
        message="Stop watching this canteen for wait-time drops?"
        confirmLabel="Delete Alert"
        onConfirm={() => {
          if (alertToDelete) {
            const res = deleteAlert(alertToDelete.id);
            if (res.ok) showToast(res.message, 'success');
          }
          setAlertToDelete(null);
        }}
        onCancel={() => setAlertToDelete(null)}
      />
    </div>
  );
};
