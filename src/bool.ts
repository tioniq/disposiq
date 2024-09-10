import {DisposableAwareCompat} from "./declarations";

/**
 * Class of a disposable that can be checked for disposal status.
 */
export class BoolDisposable implements DisposableAwareCompat {
  /**
   * @internal
   */
  private _disposed: boolean = false

  constructor(disposed: boolean = false) {
    this._disposed = disposed
  }

  /**
   * Returns true if the disposable is disposed
   */
  get disposed() {
    return this._disposed
  }

  /**
   * Dispose the object
   */
  dispose() {
    this._disposed = true
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose]() {
    this.dispose()
  }
}