import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../../telemetry/crash';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
  readonly componentStack: string;
}

const IS_DEV = import.meta.env?.DEV === true;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null, componentStack: '' };

  static getDerivedStateFromError(error: Error): Pick<ErrorBoundaryState, 'error'> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const componentStack = info.componentStack ?? '';
    this.setState({ componentStack });
    reportError(error, { componentStack });
    if (IS_DEV) {
      console.error('[ErrorBoundary]', error, componentStack);
    }
  }

  private reset = (): void => {
    this.setState({ error: null, componentStack: '' });
  };

  override render(): ReactNode {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-paper-100 text-ink-900 px-6 text-center pt-safe pb-safe">
        <div>
          <h1 className="font-serif text-[32px] font-semibold leading-[1.1] tracking-[-0.01em]">
            Something broke.
          </h1>
          <p className="mt-3 max-w-xs mx-auto font-sans text-[14px] text-ink-500">
            We hit an unexpected error. Reload and try again.
          </p>
          {IS_DEV ? (
            <details className="mt-4 max-w-md mx-auto text-left">
              <summary className="font-mono text-[11px] uppercase tracking-[0.14em] text-clay-600 cursor-pointer">
                Dev details
              </summary>
              <pre className="mt-2 p-3 rounded-[8px] bg-paper-200 border border-rule-200 text-[11px] font-mono text-ink-900 whitespace-pre-wrap break-all max-h-60 overflow-auto">
                {error.name}: {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
                {componentStack ? `\n\nComponent stack:${componentStack}` : ''}
              </pre>
            </details>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={this.reset}
            className="h-[52px] rounded-[14px] bg-ink-900 text-paper-50 font-sans text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 rounded-[12px] border border-rule-200 bg-paper-50 text-ink-700 font-sans text-[13px] active:scale-[0.97] transition-transform"
          >
            Reload app
          </button>
        </div>
      </main>
    );
  }
}
