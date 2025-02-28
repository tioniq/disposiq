import type { DisposableAware } from "./declarations";
import { Disposiq } from "./disposiq";
import { ObjectDisposedException } from "./exception";

export interface CancellationTokenLike {
  cancel(): void

  isCancelled?: boolean | (() => boolean)

  throwIfCancelled?(): void

  onCancel?(callback: () => void): void

  removeCallback?(callback: () => void): void
}

export function disposableFromCancellationToken(
  token: CancellationTokenLike
): Disposiq & DisposableAware {
  return new CancellationTokenDisposable(token)
}

const customDisposeGetter = Object.freeze(() => false)

export class CancellationTokenDisposable extends Disposiq implements DisposableAware {
  private readonly _token: CancellationTokenLike
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