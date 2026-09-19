import type {
  AsyncDisposableAwareCompat,
  DisposableAwareCompat,
  DisposeFunc,
} from "./declarations"
import { invokeAsync, onSettled, resolvedPromise } from "./utils/disposing"
import { noop, noopAsync } from "./utils/noop"
import { AsyncDisposiq, Disposiq } from "./disposiq"

/**
 * Represents an action that can be disposed. The action is invoked when the action is disposed.
 * The action is only invoked once.
 * @example
 * const action = new DisposableAction(() => {
 *    console.log("disposed")
 * })
 * action.dispose() // disposed
 * action.dispose() // no-op
 */
export class DisposableAction
  extends Disposiq
  implements DisposableAwareCompat
{
  /**
   * @internal
   */
  private _action: DisposeFunc

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: DisposeFunc) {
    super()
    this._action = typeof action === "function" ? action : noop
  }

  /**
   * Returns true if the action has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Dispose the action. If the action has already been disposed, this is a
   * no-op.
   * If the action has not been disposed, the action is invoked and the action
   * is marked as disposed.
   */
  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    const action = this._action
    // release the closure, it may hold on to large objects
    this._action = noop
    action()
  }
}

/**
 * Represents an async action that can be disposed. The action is invoked when the action is disposed.
 * The action is only invoked once.
 * @example
 * const action = new AsyncDisposableAction(async () => {
 *    console.log("disposed")
 * })
 * await action.dispose() // disposed
 * await action.dispose() // no-op
 */
export class AsyncDisposableAction
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat
{
  /**
   * @internal
   */
  private _action: () => Promise<void> | void

  /**
   * @internal
   */
  private _disposed = false

  /**
   * The disposal in progress, shared by concurrent dispose calls
   * @internal
   */
  private _disposing: Promise<void> | undefined

  constructor(action: () => Promise<void> | void) {
    super()
    this._action = typeof action === "function" ? action : noopAsync
  }

  /**
   * Returns true if the action has been disposed. It becomes true as soon as dispose is called, before the action
   * has completed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Dispose the action. The action is invoked once; calls made while it is running return the same promise (which
   * rejects if the action fails), later calls resolve immediately.
   */
  dispose(): Promise<void> {
    if (this._disposed) {
      return this._disposing ?? resolvedPromise
    }
    this._disposed = true
    const action = this._action
    // release the closure, it may hold on to large objects
    this._action = noopAsync
    const disposing = onSettled(invokeAsync(action), () => {
      this._disposing = undefined
    })
    this._disposing = disposing
    return disposing
  }
}
