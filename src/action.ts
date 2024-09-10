import {
  AsyncDisposableAwareCompat,
  DisposableAwareCompat,
  DisposeFunc
} from "./declarations";
import {noop, noopAsync} from "./utils/noop";

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
export class DisposableAction implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _action: DisposeFunc

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: DisposeFunc) {
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
    this._action()
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose()
  }
}

export class AsyncDisposableAction implements AsyncDisposableAwareCompat {
  private readonly _action: () => Promise<void>
  private _disposed = false

  constructor(action: () => Promise<void>) {
    this._action = typeof action === "function" ? action : noopAsync
  }

  get disposed(): boolean {
    return this._disposed
  }

  async dispose() {
    if (this._disposed) {
      return
    }
    this._disposed = true
    await this._action()
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.dispose()
  }
}