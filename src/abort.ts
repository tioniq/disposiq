import type { DisposableAwareCompat } from "./declarations"
import { Disposiq } from "./disposiq"

/**
 * Disposable container for AbortController. It will abort the signal when it is disposed.
 */
export class AbortDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _controller: AbortController

  constructor(controller: AbortController) {
    super()
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

  dispose(): void {
    this._controller.abort()
  }
}
