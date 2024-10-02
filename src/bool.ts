import {DisposableAwareCompat} from "./declarations";
import {Disposiq} from "./disposiq";

/**
 * Class of a disposable that can be checked for disposal status.
 */
export class BoolDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private _disposed: boolean = false

  constructor(disposed: boolean = false) {
    super()
    this._disposed = disposed
  }

  /**
   * Returns true if the disposable is disposed
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Dispose the object
   */
  dispose() {
    this._disposed = true
  }
}