interface StreakBadgeProps {
  readonly days: number;
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 bg-paper-50 border border-rule-200 rounded-full shadow-sh-1"
      style={{ padding: '6px 10px 6px 8px', borderWidth: '1.5px' }}
    >
      <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
        <path
          d="M7 1 C 9 4, 12 5, 12 9 C 12 13, 9.5 15, 7 15 C 4.5 15, 2 13, 2 9 C 2 7, 3 6, 4 5 C 4.5 6.5, 5.5 7, 6 6 C 6.5 4.5, 6 2.5, 7 1 Z"
          fill="var(--clay-500)"
          stroke="var(--clay-700)"
          strokeWidth="1.2"
        />
      </svg>
      <span className="font-serif font-bold text-[14px] text-ink-900">{days}</span>
    </div>
  );
}
