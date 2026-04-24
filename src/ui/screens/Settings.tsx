import { useState } from 'react';
import { Header, IconButton } from '../components/Header';

interface SettingsProps {
  readonly darkMode: boolean;
  readonly onToggleDark: (value: boolean) => void;
  readonly onBack: () => void;
  readonly onResetProgress: () => void;
}

export function Settings({ darkMode, onToggleDark, onBack, onResetProgress }: SettingsProps) {
  const [hapticsOn, setHapticsOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <main className="h-screen flex flex-col pb-safe">
      <div className="pt-safe">
        <Header
          title="Settings"
          left={
            <IconButton label="Back" onClick={onBack}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          }
        />
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col gap-2">
        <Toggle label="Dark mode" value={darkMode} onChange={onToggleDark} />
        <Toggle label="Haptics" value={hapticsOn} onChange={setHapticsOn} />
        <Toggle label="Sound" value={soundOn} onChange={setSoundOn} />
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="mt-4 h-tap rounded-[12px] border border-rule-200 bg-paper-50 text-ink-900 font-sans text-[14px] font-medium text-left px-4 active:scale-[0.98] transition-transform"
        >
          Restart progress
        </button>
        <p className="mt-auto text-center font-sans text-[11px] text-ink-500">Tangle v0.1</p>
      </div>
      {confirmReset ? (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-40 bg-ink-900/60 flex items-center justify-center px-6"
        >
          <div className="bg-paper-50 rounded-[16px] p-5 max-w-xs w-full text-center">
            <h3 className="font-serif text-[18px] font-semibold">Restart progress?</h3>
            <p className="mt-1 font-sans text-[13px] text-ink-700">
              This clears your stars and puts you back on level 1.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 h-tap rounded-[12px] border border-rule-200 bg-paper-50 text-ink-700 font-sans text-[13px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onResetProgress();
                }}
                className="flex-1 h-tap rounded-[12px] bg-ink-900 text-paper-50 font-sans text-[13px] font-semibold"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="h-tap px-4 rounded-[12px] border border-rule-200 bg-paper-50 flex items-center justify-between active:scale-[0.99] transition-transform"
    >
      <span className="font-sans text-[14px] text-ink-900">{label}</span>
      <span
        className={`w-10 h-6 rounded-full transition-colors ${
          value ? 'bg-ink-900' : 'bg-rule-200'
        }`}
      >
        <span
          className={`block w-5 h-5 bg-paper-50 rounded-full mt-0.5 transition-transform ${
            value ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
