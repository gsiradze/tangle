import type { ReactNode } from 'react';

interface MonoLabelProps {
  readonly children: ReactNode;
  readonly color?: string;
  readonly size?: number;
}

export function MonoLabel({ children, color = 'var(--ink-400)', size = 10 }: MonoLabelProps) {
  return (
    <span
      className="font-mono uppercase font-medium"
      style={{
        fontSize: size,
        letterSpacing: '0.14em',
        color,
      }}
    >
      {children}
    </span>
  );
}
