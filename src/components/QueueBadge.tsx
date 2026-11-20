import React from 'react';
import { CheckCircle2, Clock, Flame, Lock } from 'lucide-react';
import { QueueLevel } from '../types/queuecast';

interface QueueBadgeProps {
  level: QueueLevel;
  isOpen?: boolean;
  size?: 'sm' | 'md';
}

export const QueueBadge: React.FC<QueueBadgeProps> = ({
  level,
  isOpen = true,
  size = 'md',
}) => {
  if (!isOpen) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 bg-neutral-100 text-neutral-600 border border-neutral-200 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Closed
      </span>
    );
  }

  if (level === 'Low') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 bg-[#4CAF7A]/12 text-[#237A4B] border border-[#4CAF7A]/30 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF7A] shrink-0" aria-hidden="true" />
        Low Queue
      </span>
    );
  }

  if (level === 'Medium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 bg-[#E5A100]/12 text-[#9B6B00] border border-[#E5A100]/35 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-[#E5A100] shrink-0" aria-hidden="true" />
        Medium Queue
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold whitespace-nowrap shrink-0 bg-[#C0392B]/12 text-[#C0392B] border border-[#C0392B]/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Flame className="w-3.5 h-3.5 text-[#C0392B] shrink-0" aria-hidden="true" />
      High Queue
    </span>
  );
};
