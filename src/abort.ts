import {DisposableAwareCompat} from "./declarations";

/**
 * Disposable container for AbortController. It will abort the signal when it is disposed.
 */
export class AbortDisposable implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _controller: AbortController

  constructor(controller: AbortController) {
    this._controller = controller
  }

  /**
   * Returns true if the signal is aborted
   */
  get disposed(): boolean {
    return this._controller.signal.aborted
  }

  /**
   * Returns the signal of the AbortController
   */
  get signal(): AbortSignal {
    return this._controller.signal
  }

  /**
   * Abort the signal
   */
  dispose(): void {
    this._controller.abort()
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose()
  }
}