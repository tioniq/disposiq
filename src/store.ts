import type {
  DisposableAwareCompat,
  DisposableLike,
  IDisposablesContainer,
} from "./declarations"
import { Disposiq } from "./disposiq"
import { ObjectDisposedException } from "./exception"
import {
  disposeAllSafely,
  disposeAllUnsafe,
  justDispose,
  justDisposeAll,
} from "./dispose-batch"
import { disposeAllSafe } from "./aliases"

/**
 * DisposableStore is a container for disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
export class DisposableStore
  extends Disposiq
  implements IDisposablesContainer, DisposableAwareCompat
{
  /**
   * @internal
   */
  private readonly _disposables: DisposableLike[]

  /**
   * @internal
   */
  private _disposed = false

  constructor() {
    super()
    this._disposables = new Array<DisposableLike>()
  }

  /**
   * Returns true if the object has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  add(...disposables: (DisposableLike | null | undefined)[]): void

  add(disposables: (DisposableLike | null | undefined)[]): void

  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   */
  add(
    ...disposables: (
      | DisposableLike
      | (DisposableLike | null | undefined)[]
      | null
      | undefined
    )[]
  ): void {
    if (!disposables || disposables.length === 0) {
      return
    }
    const first = disposables[0]
    const value = Array.isArray(first)
      ? (first as DisposableLike[])
      : (disposables as DisposableLike[])
    if (this._disposed) {
      justDisposeAll(value)
      return
    }
    for (let i = 0; i < value.length; i++) {
      const disposable = value[i]
      if (!disposable) {
        continue
      }
      this._disposables.push(disposable as DisposableLike)
    }
  }

  /**
   * Add multiple disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables an array of disposables to add
   */
  addAll(disposables: (DisposableLike | null | undefined)[]): void {
    if (!disposables || disposables.length === 0) {
      return
    }
    if (this._disposed) {
      justDisposeAll(disposables)
      return
    }
    for (let i = 0; i < disposables.length; i++) {
      const disposable = disposables[i]
      if (!disposable) {
        continue
      }
      this._disposables.push(disposable)
    }
  }

  /**
   * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
   * @param disposable a disposable to add
   * @returns the disposable object
   */
  addOne(disposable: DisposableLike | null | undefined): void {
    if (!disposable) {
      return
    }
    if (this._disposed) {
      justDispose(disposable)
      return
    }
    this._disposables.push(disposable)
  }

  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
   * @param disposable a disposable to remove
   * @returns true if the disposable was found and removed
   */
  remove(disposable: DisposableLike | null | undefined): boolean {
    if (!disposable || this._disposed) {
      return false
    }
    const index = this._disposables.indexOf(disposable)
    if (index === -1) {
      return false
    }
    this._disposables.splice(index, 1)
    return true
  }

  /**
   * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
   * @param callback a callback to call when the timeout expires
   * @param timeout the number of milliseconds to wait before calling the callback
   */
  addTimeout(callback: () => void, timeout: number): void

  /**
   * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
   * @param timeout a timeout handle
   */
  addTimeout(timeout: ReturnType<typeof setTimeout> | number): void

  /**
   * @internal
   */
  addTimeout(
    callbackOrTimeout: (() => void) | ReturnType<typeof setTimeout> | number,
    timeout?: number | undefined,
  ): void {
    if (typeof callbackOrTimeout === "function") {
      const handle = setTimeout(callbackOrTimeout, timeout)
      this.addOne(() => clearTimeout(handle))
      return
    }
    this.addOne(() => clearTimeout(callbackOrTimeout))
  }

  /**
   * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   */
  addInterval(callback: () => void, interval: number): void

  /**
   * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
   * @param interval an interval handle
   */
  addInterval(interval: ReturnType<typeof setInterval> | number): void

  /**
   * @internal
   */
  addInterval(
    callbackOrInterval: (() => void) | ReturnType<typeof setInterval> | number,
    interval?: number | undefined,
  ): void {
    if (typeof callbackOrInterval === "function") {
      const handle = setInterval(callbackOrInterval, interval)
      this.addOne(() => clearInterval(handle))
      return
    }
    this.addOne(() => clearInterval(callbackOrInterval))
  }

  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message?: string): void {
    if (this._disposed) {
      throw new ObjectDisposedException(message)
    }
  }

  use<T extends DisposableLike>(supplier: () => T): T

  use<T extends DisposableLike>(supplier: () => Promise<T>): Promise<T>

  use<T extends DisposableLike>(supplier: () => T | Promise<T>): T | Promise<T>

  /**
   * Accepts a function that returns a disposable and adds it to the store. If the function is asynchronous,
   * it waits for the result and then adds it to the store. Returns a Promise if the supplier is asynchronous,
   * otherwise returns the disposable directly.
   * @param supplier A function that returns a disposable or a promise resolving to a disposable.
   * @returns The disposable or a promise resolving to the disposable.
   */
  use<T extends DisposableLike>(
    supplier: () => T | Promise<T>,
  ): T | Promise<T> {
    const result = supplier()
    if (result instanceof Promise) {
      return result.then((disposable) => {
        if (this._disposed) {
          justDispose(disposable)
          return disposable
        }
        this._disposables.push(disposable)
        return disposable
      })
    }
    if (this._disposed) {
      justDispose(result)
      return result
    }
    this._disposables.push(result)
    return result
  }

  /**
   * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
   * store. The store can continue to be used after this method is called. This method is useful when the store is
   * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
   * this method will safely add the disposable to the store without disposing it immediately.
   */
  disposeCurrent(): void {
    if (this._disposed) {
      return
    }
    disposeAllSafe(this._disposables)
  }

  /**
   * Dispose the store and all disposables safely. If an error occurs during disposal, the error is caught and
   * passed to the onErrorCallback.
   */
  disposeSafely(onErrorCallback?: (e: unknown) => void): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    disposeAllSafely(this._disposables, onErrorCallback)
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    disposeAllUnsafe(this._disposables)
  }

  /**
   * Create a disposable store from an array of values. The values are mapped to disposables using the provided
   * mapper function.
   * @param values an array of values
   * @param mapper a function that maps a value to a disposable
   */
  static from<T>(
    values: T[],
    mapper: (value: T) => DisposableLike,
  ): DisposableStore

  /**
   * Create a disposable store from an array of disposables.
   * @param disposables an array of disposables
   * @returns a disposable store containing the disposables
   */
  static from(
    disposables: (DisposableLike | null | undefined)[],
  ): DisposableStore

  static from<T>(
    disposables: (DisposableLike | null | undefined)[] | T[],
    mapper?: (value: T) => DisposableLike,
  ): DisposableStore {
    if (typeof mapper === "function") {
      const store = new DisposableStore()
      store.addAll((disposables as T[]).map(mapper))
      return store
    }
    const store = new DisposableStore()
    store.addAll(disposables as (DisposableLike | null | undefined)[])
    return store
  }
}
