import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                destructive
                  ? 'bg-[#C0392B]/10 text-[#C0392B]'
                  : 'bg-[#F26A2A]/12 text-[#F26A2A]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3
              id="confirm-modal-title"
              className="font-display text-lg font-bold text-[#333333]"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
            aria-label="Close confirmation dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 min-h-[42px] rounded-xl text-sm font-semibold text-white transition-colors whitespace-nowrap ${
              destructive
                ? 'bg-[#C0392B] hover:bg-[#A31621]'
                : 'bg-[#C00000] hover:bg-[#A31621]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
