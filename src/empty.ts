import {DisposableCompat} from "./declarations";

const emptyDisposableImpl: DisposableCompat = {
  dispose: function () {
  },

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose]: function () {
  }
}

/**
 * An empty disposable that does nothing when disposed.
 */
export const emptyDisposable: DisposableCompat = Object.freeze(emptyDisposableImpl)
