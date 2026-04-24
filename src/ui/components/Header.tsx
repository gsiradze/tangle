import type { CSSProperties, ReactNode } from 'react';

interface HeaderProps {
  readonly left?: ReactNode;
  readonly center?: ReactNode;
  readonly right?: ReactNode;
  readonly title?: string;
  readonly border?: boolean;
}

export function Header({ left, center, right, title, border = true }: HeaderProps) {
  return (
    <header
      className={`px-3.5 py-2.5 flex items-center gap-2 ${border ? 'border-b border-rule-200' : ''}`}
    >
      <div className="min-w-[44px] h-[44px] flex items-center">{left}</div>
      <div className="flex-1 flex items-center justify-center">
        {center ?? (
          <span className="font-serif text-[17px] font-semibold text-ink-900">{title}</span>
        )}
      </div>
      <div className="min-w-[44px] h-[44px] flex items-center justify-end">{right}</div>
    </header>
  );
}

interface IconButtonProps {
  readonly label: string;
  readonly onClick?: () => void;
  readonly children: ReactNode;
  readonly size?: number;
  readonly dark?: boolean;
}

export function IconButton({ label, onClick, children, size = 40, dark = false }: IconButtonProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    borderWidth: '1.5px',
    borderRadius: 10,
  };
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={style}
      className={[
        'flex items-center justify-center border-solid shadow-sh-1 transition-transform duration-nudge',
        dark
          ? 'bg-fill-900 text-paper-100 border-fill-800'
          : 'bg-paper-50 text-ink-700 border-rule-300',
        'active:scale-[0.96]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
