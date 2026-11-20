import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconDims =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl'
      : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${iconDims} rounded-xl bg-gradient-to-br from-[#C00000] via-[#A31621] to-[#F26A2A] flex items-center justify-center shadow-sm shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="16" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="11.5" y="11" width="4" height="15" rx="1.5" fill="currentColor" opacity="0.9" />
          <rect x="18" y="6" width="4" height="20" rx="1.5" fill="currentColor" />
          <circle cx="25.5" cy="9.5" r="2.5" fill="#FDE68A" />
        </svg>
      </div>
      <div className="min-w-0">
        <span
          className={`font-display font-bold tracking-tight text-[#333333] whitespace-nowrap block leading-none ${textClass}`}
        >
          Queue<span className="text-[#C00000]">Cast</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-neutral-500 font-medium block mt-0.5 whitespace-nowrap">
            Know the Queue. Plan Your Meal.
          </span>
        )}
      </div>
    </div>
  );
};
