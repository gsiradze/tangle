import { useState } from 'react';

const STEPS: readonly string[] = [
  'Drag the dots to move them.',
  'Untangle the lines so nothing crosses.',
  'Take your time. No timer. No pressure.',
];

interface OnboardingOverlayProps {
  readonly onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);

  const advance = (): void => {
    if (step >= STEPS.length - 1) {
      onDismiss();
      return;
    }
    setStep(step + 1);
  };

  return (
    <button
      type="button"
      onClick={advance}
      aria-label="Continue onboarding"
      className="absolute inset-0 z-30 bg-ink-900/60 flex flex-col items-center justify-end px-6 pb-24 cursor-pointer"
    >
      <div className="bg-paper-50 text-ink-900 rounded-[16px] px-5 py-4 max-w-xs text-center shadow-lg">
        <p className="font-sans text-[15px] leading-[1.45]">{STEPS[step]}</p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-[width,opacity] ${
                i === step ? 'w-6 bg-ink-900' : 'w-1.5 bg-rule-200'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 font-sans text-[11px] text-ink-500">Tap anywhere to continue</p>
      </div>
    </button>
  );
}
