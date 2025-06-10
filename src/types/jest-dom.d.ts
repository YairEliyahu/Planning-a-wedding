/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value?: string | number | string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: unknown[]): R;
    }
  }
}

declare namespace expect {
  function objectContaining(sample: Record<string, unknown>): unknown;
}

export {}; 