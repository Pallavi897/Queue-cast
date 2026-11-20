import React from 'react';
import { Bell, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useQueueCast } from '../context/QueueCastContext';

export const ToastBanner: React.FC = () => {
  const {
    toasts,
    dismissToast,
    notifications,
    dismissNotification,
    openCanteenDetail,
  } = useQueueCast();

  const unreadAlerts = notifications.filter((n) => !n.read).slice(0, 2);

  return (
    <>
      {/* In-App Alert Notification Banners (triggered by queue thresholds) */}
      {unreadAlerts.length > 0 && (
        <div className="mb-4 space-y-2" role="region" aria-label="In-app queue alerts">
          {unreadAlerts.map((notif) => (
            <div
              key={notif.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#4CAF7A]/12 border border-[#4CAF7A]/35 px-4 py-3 text-sm text-[#1F5E3B]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#4CAF7A] text-white flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#184B2E]">{notif.message}</p>
                  <p className="text-xs text-[#2B6E48]">
                    In-app alert only (no SMS or push sent) ·{' '}
                    {new Date(notif.timestamp).toLocaleTimeString('en-IN', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    dismissNotification(notif.id);
                    openCanteenDetail(notif.canteenId);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#237A4B] text-white text-xs font-semibold hover:bg-[#1B603B] transition-colors whitespace-nowrap"
                >
                  View Canteen
                </button>
                <button
                  type="button"
                  onClick={() => dismissNotification(notif.id)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#237A4B] hover:bg-[#4CAF7A]/20 transition-colors"
                  aria-label="Dismiss alert notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Feedback Toasts */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-white border-[#4CAF7A]/40 text-[#1F5E3B]'
                  : toast.type === 'error'
                  ? 'bg-white border-[#C0392B]/40 text-[#C0392B]'
                  : 'bg-white border-neutral-200 text-[#333333]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF7A] shrink-0" />
                ) : toast.type === 'error' ? (
                  <XCircle className="w-4 h-4 text-[#C0392B] shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[#F26A2A] shrink-0" />
                )}
                <span className="truncate">{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md shrink-0"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
