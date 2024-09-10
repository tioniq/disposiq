import {AsyncDisposableAwareCompat, DisposableAwareCompat} from "./declarations";
import {ExceptionHandlerManager} from "./utils/exception-handler-manager";
import {noop, noopAsync} from "./utils/noop";

export const safeDisposableExceptionHandlerManager = new ExceptionHandlerManager()

/**
 * Represents a safe action that can be disposed. The action is invoked when the action is disposed.
 */
export class SafeActionDisposable implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _action: () => void

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: () => void) {
    this._action = typeof action === "function" ? action : noop
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
  dispose() {
    if (this._disposed) {
      return
    }
    this._disposed = true
    try {
      this._action()
    } catch (e) {
      safeDisposableExceptionHandlerManager.handleAny(e)
    }
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose();
  }
}

/**
 * Represents a safe async action that can be disposed. The action is invoked when the action is disposed.
 */
export class SafeAsyncActionDisposable implements AsyncDisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _action: () => Promise<void>

  /**
   * @internal
   */
  private _disposed = false

  constructor(action: () => Promise<void>) {
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
      safeDisposableExceptionHandlerManager.handleAny(e)
    }
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.dispose()
  }
}