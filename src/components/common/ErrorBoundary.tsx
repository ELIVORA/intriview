/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GLOBAL_ERROR_BOUNDARY] Uncaught rendering exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/40 text-red-400 mb-5">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              An unexpected rendering exception was caught inside the interface layer.
              Please reload the workspace or contact the platform administrator if the issue persists.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono bg-zinc-950 text-red-400 p-4 rounded-xl border border-zinc-850 mb-6 text-left max-h-32 overflow-auto whitespace-pre-wrap leading-normal">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
