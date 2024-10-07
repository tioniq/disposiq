import {DisposableCompat, IDisposablesContainer} from "./declarations";

/**
 * Disposiq is a base class for disposables. The only reason is to have ability to extend it with additional functionality.
 */
export abstract class Disposiq implements DisposableCompat {
  /**
   * Dispose the object. If the object has already been disposed, this should be a no-op
   */
  abstract dispose(): void;

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose();
  }
}

export abstract class AsyncDisposiq extends Disposiq {
  abstract dispose(): Promise<void>;

  /**
   * Support for the internal Disposable API
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.dispose();
  }
}

export interface Disposiq {
  disposeWith(container: IDisposablesContainer): void;
}
