import type { AsyncDisposableCompat, DisposableCompat } from "./declarations"
import { AsyncDisposiq, type Disposiq } from "./disposiq"

const emptyPromise = Promise.resolve()

class EmptyDisposable
  extends AsyncDisposiq
  implements DisposableCompat, AsyncDisposableCompat {
  dispose(): Promise<void> {
    return emptyPromise
  }

  override [Symbol.dispose](): void {
  }

  override [Symbol.asyncDispose](): Promise<void> {
    return emptyPromise
  }
}

const emptyDisposableImpl = new EmptyDisposable()

/**
 * An empty disposable that does nothing when disposed.
 */
export const emptyDisposable: Disposiq &
  AsyncDisposiq &
  DisposableCompat &
  AsyncDisposableCompat = Object.freeze(emptyDisposableImpl)
