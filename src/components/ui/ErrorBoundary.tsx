import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last-resort guard so a chat render error doesn't leave a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-white mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-400 mb-4 break-words">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm cursor-pointer"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }
}
