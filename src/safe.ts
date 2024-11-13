import type {
  AsyncDisposableAwareCompat,
  DisposableAwareCompat,
} from "./declarations"
import { ExceptionHandlerManager } from "./utils/exception-handler-manager"
import { noop, noopAsync } from "./utils/noop"
import { AsyncDisposiq, Disposiq } from "./disposiq"

export const safeDisposableExceptionHandlerManager: ExceptionHandlerManager =
  new ExceptionHandlerManager()

/**
 * Represents a safe action that can be disposed. The action is invoked when the action is disposed.
 */
export class SafeActionDisposable
  extends Disposiq
  implements DisposableAwareCompat
{
  /**
   * @internal
   */
  private readonly _action: () => void

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: () => void) {
    super()
    this._action = typeof action === "function" ? action : noop
  }

  /**
   * Returns true if the action has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  dispose() {
    if (this._disposed) {
      return
    }
    this._disposed = true
    try {
      this._action()
    } catch (e) {
      safeDisposableExceptionHandlerManager.handle(e)
    }
  }
}

/**
 * Represents a safe async action that can be disposed. The action is invoked when the action is disposed.
 */
export class SafeAsyncActionDisposable
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat
{
  /**
   * @internal
   */
  private readonly _action: () => Promise<void>

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: () => Promise<void>) {
    super()
    this._action = typeof action === "function" ? action : noopAsync
  }

  /**
   * Returns true if the action has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Dispose the action. If the action has already been disposed, this is a no-op.
   */
  async dispose(): Promise<void> {
    if (this._disposed) {
      return
    }
    this._disposed = true
    try {
      await this._action()
    } catch (e) {
      safeDisposableExceptionHandlerManager.handle(e)
    }
  }
}
