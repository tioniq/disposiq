import { DisposableCompat, IDisposablesContainer } from "./declarations";

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
  /**
   * Dispose the object when the container is disposed.
   * @param container a container to add the disposable to
   */
  disposeWith(container: IDisposablesContainer): void;

  /**
   * Dispose the object after a specified time.
   * @param ms time in milliseconds
   */
  disposeIn(ms: number): void;

  /**
   * Convert the object to a function that disposes the object.
   */
  toFunction(): () => void;
}
