import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State { hasError: boolean; msg: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, msg: '' };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, msg: err instanceof Error ? err.message : String(err) };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-2xl border border-eye-red/30 bg-eye-red/5 p-8 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm text-cloud-muted">Erro ao carregar esta seção.</p>
          <button
            onClick={() => this.setState({ hasError: false, msg: '' })}
            className="mt-3 text-xs text-eye-red hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
