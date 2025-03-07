import type { CancellationTokenLike, DisposableAware, DisposableAwareCompat } from "./declarations";
import { Disposiq } from "./disposiq";
import { ObjectDisposedException } from "./exception";

/**
 * Converts a cancellation token into a disposable object that can be used
 * to manage and respond to cancellation requests.
 *
 * @param {CancellationTokenLike} token - The cancellation token to be wrapped
 * into a disposable instance.
 * @return {Disposiq & DisposableAware} A disposable object that represents
 * the behavior associated with the provided cancellation token.
 */
export function disposableFromCancellationToken(
  token: CancellationTokenLike
): Disposiq & DisposableAware {
  return new CancellationTokenDisposable(token)
}

const customDisposeGetter = Object.freeze(() => false)

/**
 * Represents a disposable object that manages cancellation token.
 * This class provides an abstraction for working with cancellation tokens
 * and exposes a mechanism to track if it has been disposed.
 * Implements the DisposableAware interface.
 */
export class CancellationTokenDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _token: CancellationTokenLike

  /**
   * @internal
   */
  private _disposedGetter: () => boolean

  constructor(token: CancellationTokenLike) {
    super()
    if (token == null) {
      throw new Error("Invalid token")
    }
    this._token = token
    const isCancelledType = typeof token.isCancelled
    if (isCancelledType === "function") {
      this._disposedGetter = () => (token.isCancelled as () => boolean)()
    } else if (isCancelledType === "boolean") {
      this._disposedGetter = () => token.isCancelled as boolean
    } else if (typeof token.onCancel === "function") {
      let cancelled = false
      token.onCancel(() => {
        cancelled = true
      })
      this._disposedGetter = () => cancelled
    } else {
      this._disposedGetter = customDisposeGetter
    }
  }

  get disposed(): boolean {
    return this._disposedGetter()
  }

  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message?: string): void {
    if (this.disposed) {
      throw new ObjectDisposedException(message)
    }
  }

  dispose() {
    if (this._disposedGetter === customDisposeGetter) {
      this._disposedGetter = () => true
    }
    this._token.cancel()
  }
}