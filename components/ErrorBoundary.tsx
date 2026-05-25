"use client";

import { Component, ReactNode } from "react";

export type ErrorBoundaryProps = {
  children: ReactNode;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
          <div>
            <p className="text-lg font-semibold">Something went wrong.</p>
            <p className="mt-2 text-sm text-slate-300">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
