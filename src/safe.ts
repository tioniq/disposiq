import type { AsyncDisposableAwareCompat, DisposableAwareCompat, } from "./declarations"
import { AsyncDisposiq, Disposiq } from "./disposiq"
import { invokeAsync, resolvedPromise } from "./utils/disposing"
import { ExceptionHandlerManager } from "./utils/exception-handler-manager"
import { noop, noopAsync } from "./utils/noop"

/**
 * A variable that manages exception handling for safe disposable objects.
 *
 * The `safeDisposableExceptionHandlerManager` is an instance of
 * the `ExceptionHandlerManager` class. It is designed to handle the
 * registration, management, and execution of exception handlers,
 * ensuring robust error management in systems involving disposable
 * resources.
 */
export const safeDisposableExceptionHandlerManager: ExceptionHandlerManager =
  new ExceptionHandlerManager()

/**
 * Represents a safe action that can be disposed. The action is invoked when the action is disposed.
 */
export class SafeActionDisposable
  extends Disposiq
  implements DisposableAwareCompat {
  /**
   * @internal
   */
  private _action: () => void

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
    const action = this._action
    this._action = noop
    try {
      action()
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
  implements AsyncDisposableAwareCompat {
  /**
   * @internal
   */
  private _action: () => Promise<void>

  /**
   * @internal
   */
  private _disposed = false

  /**
   * The disposal in progress, shared by concurrent dispose calls
   * @internal
   */
  private _disposing: Promise<void> | undefined

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
   * Dispose the action. If the action has already been disposed, this is a no-op. Calls made while the action is
   * running return a promise that settles when it completes.
   */
  dispose(): Promise<void> {
    if (this._disposed) {
      return this._disposing ?? resolvedPromise
    }
    this._disposed = true
    const action = this._action
    this._action = noopAsync
    const disposing = invokeAsync(action).then(
      () => {
        this._disposing = undefined
      },
      (e: unknown) => {
        this._disposing = undefined
        safeDisposableExceptionHandlerManager.handle(e)
      },
    )
    this._disposing = disposing
    return disposing
  }
}
