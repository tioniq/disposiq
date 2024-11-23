import { AsyncDisposiq } from "./disposiq"
import type {
  AsyncDisposableAwareCompat,
  AsyncDisposableLike,
  DisposableLike,
} from "./declarations"
import { ObjectDisposedException } from "./exception"
import {
  disposeAllAsync,
  disposeAllSafelyAsync,
  disposeAllUnsafeAsync,
  justDisposeAllAsync,
  justDisposeAsync,
} from "./dispose-batch"

/**
 * AsyncDisposableStore is a container for async disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
export class AsyncDisposableStore
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat
{
  /**
   * @internal
   */
  private readonly _disposables: (AsyncDisposableLike | DisposableLike)[] = []

  /**
   * @internal
   */
  private _disposed = false

  /**
   * Returns true if the object has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  add(
    ...disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]
  ): void

  add(
    disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
  ): void

  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   * @returns void if the container has not been disposed, otherwise a promise that resolves when all disposables have been disposed
   */
  add(
    ...disposables: (
      | AsyncDisposableLike
      | DisposableLike
      | null
      | undefined
      | (AsyncDisposableLike | DisposableLike | null | undefined)[]
    )[]
  ): void | Promise<void> {
    if (!disposables || disposables.length === 0) {
      return
    }
    const first = disposables[0]
    const value = Array.isArray(first)
      ? (first as (AsyncDisposableLike | DisposableLike | null | undefined)[])
      : (disposables as (
          | AsyncDisposableLike
          | DisposableLike
          | null
          | undefined
        )[])
    if (this._disposed) {
      return justDisposeAllAsync(value)
    }
    for (let i = 0; i < value.length; i++) {
      const disposable = value[i]
      if (!disposable) {
        continue
      }
      this._disposables.push(
        disposable as AsyncDisposableLike | DisposableLike | null | undefined,
      )
    }
  }

  addAll(
    disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
  ): void | Promise<void> {
    if (!disposables || disposables.length === 0) {
      return
    }
    if (this._disposed) {
      return justDisposeAllAsync(disposables)
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
   * @returns void if the container has not been disposed, otherwise a promise that resolves when the disposable has been disposed
   */
  addOne(
    disposable: AsyncDisposableLike | DisposableLike | null | undefined,
  ): void | Promise<void> {
    if (!disposable) {
      return
    }
    if (this._disposed) {
      return justDisposeAsync(disposable)
    }
    this._disposables.push(disposable)
  }

  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
   * @param disposable the disposable to remove
   * @returns true if the disposable was removed, false otherwise
   */
  remove(
    disposable: AsyncDisposableLike | DisposableLike | null | undefined,
  ): boolean {
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
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message?: string): void {
    if (this._disposed) {
      throw new ObjectDisposedException(message)
    }
  }

  /**
   * Dispose all disposables in the store. The store does not become disposed.
   */
  disposeCurrent(): Promise<void> {
    if (this._disposed) {
      return Promise.resolve()
    }
    return disposeAllAsync(this._disposables)
  }

  /**
   * Dispose all disposables in the store safely. The store becomes disposed.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeSafely(onErrorCallback?: (e: unknown) => void): Promise<void> {
    if (this._disposed) {
      return
    }
    return disposeAllSafelyAsync(this._disposables, onErrorCallback)
  }

  dispose(): Promise<void> {
    if (this._disposed) {
      return Promise.resolve()
    }
    this._disposed = true
    return disposeAllUnsafeAsync(this._disposables)
  }

  /**
   * Create an async disposable store from an array of values. The values are mapped to disposables using the provided
   * mapper function.
   * @param values an array of values
   * @param mapper a function that maps a value to a disposable
   */
  static from<T>(
    values: T[],
    mapper: (
      value: T,
    ) => AsyncDisposableLike | DisposableLike | null | undefined,
  ): AsyncDisposableStore

  /**
   * Create an async disposable store from an array of disposables.
   * @param disposables an array of disposables
   * @returns a disposable store containing the disposables
   */
  static from(
    disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
  ): AsyncDisposableStore

  static from<T>(
    disposables:
      | (AsyncDisposableLike | DisposableLike | null | undefined)[]
      | T[],
    mapper?: (
      value: T,
    ) => AsyncDisposableLike | DisposableLike | null | undefined,
  ): AsyncDisposableStore {
    if (typeof mapper === "function") {
      const store = new AsyncDisposableStore()
      store.add((disposables as T[]).map(mapper))
      return store
    }
    const store = new AsyncDisposableStore()
    store.addAll(disposables as (AsyncDisposableLike | DisposableLike)[])
    return store
  }
}
