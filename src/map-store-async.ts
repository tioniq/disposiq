import type { AsyncDisposableAwareCompat, IAsyncDisposable, IDisposable, } from "./declarations"
import { justDisposeAllAsync, justDisposeAsync } from "./dispose-batch"
import { AsyncDisposiq } from "./disposiq"
import { onSettled, resolvedPromise } from "./utils/disposing"
import { noop } from "./utils/noop"

/**
 * A key-value store of values disposed asynchronously: the async counterpart of {@link DisposableMapStore}.
 * Replacing or deleting a value disposes it, and the returned promise settles when that disposal has finished.
 * Disposing the store disposes every value in insertion order, one after another, after the disposals already in
 * progress.
 * @typeParam K the key type
 * @typeParam V the value type
 */
export class AsyncDisposableMapStore<K, V extends IAsyncDisposable | IDisposable = IAsyncDisposable | IDisposable>
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat, Iterable<[K, V]> {
  /**
   * @internal
   */
  private readonly _map = new Map<K, V>()

  /**
   * Disposals of replaced or deleted values that are still in progress; they never reject
   * @internal
   */
  private readonly _releasing = new Set<Promise<void>>()

  /**
   * @internal
   */
  private _disposed = false

  /**
   * @internal
   */
  private _disposing: Promise<void> | undefined

  /**
   * Returns true if the store has been disposed. It becomes true as soon as dispose is called, before the values have
   * finished disposing.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * The number of values in the store
   */
  get size(): number {
    return this._map.size
  }

  /**
   * Get the value for the key
   * @param key the key
   * @returns the value or undefined if the key is not found
   */
  get(key: K): V | undefined {
    return this._map.get(key)
  }

  /**
   * Check whether the store has a value for the key
   * @param key the key
   */
  has(key: K): boolean {
    return this._map.has(key)
  }

  /**
   * The keys of the store, in insertion order
   */
  keys(): IterableIterator<K> {
    return this._map.keys()
  }

  /**
   * The values of the store, in insertion order
   */
  values(): IterableIterator<V> {
    return this._map.values()
  }

  /**
   * The key-value pairs of the store, in insertion order
   */
  entries(): IterableIterator<[K, V]> {
    return this._map.entries()
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._map.entries()
  }

  /**
   * Set the value for the key. The value it replaces (unless it is the same value) is disposed. If the store is
   * disposed, the value is disposed instead.
   * @param key the key
   * @param value the value
   * @returns a promise that settles when the replaced (or rejected) value has been disposed, and rejects if that fails
   */
  set(key: K, value: V): Promise<void> {
    if (this._disposed) {
      return this._release(value)
    }
    const prev = this._map.get(key)
    this._map.set(key, value)
    return prev === undefined || prev === value
      ? resolvedPromise
      : this._release(prev)
  }

  /**
   * Delete the value for the key and dispose it
   * @param key the key
   * @returns a promise that resolves with true once the value has been disposed, or with false if the key is not
   * found; it rejects if the disposal fails
   */
  async delete(key: K): Promise<boolean> {
    const value = this._map.get(key)
    if (value === undefined) {
      return false
    }
    this._map.delete(key)
    await this._release(value)
    return true
  }

  /**
   * Remove the value for the key and return it. The value is not disposed
   * @param key the key
   * @returns the value or undefined if the key is not found
   */
  extract(key: K): V | undefined {
    const value = this._map.get(key)
    if (value === undefined) {
      return undefined
    }
    this._map.delete(key)
    return value
  }

  /**
   * Dispose the store and every value, in insertion order, after the disposals of replaced or deleted values that are
   * already in progress. Every value is disposed even if some of them reject; the returned promise then rejects with
   * the error (several errors are wrapped in an AggregateError). Calls made while the disposal is in progress return
   * the same promise, later calls resolve immediately.
   */
  dispose(): Promise<void> {
    if (this._disposed) {
      return this._disposing ?? resolvedPromise
    }
    this._disposed = true
    const values = Array.from(this._map.values())
    this._map.clear()
    const running = Array.from(this._releasing)
    const disposing = onSettled(
      Promise.all(running).then(() => justDisposeAllAsync(values)),
      () => {
        this._disposing = undefined
      },
    )
    this._disposing = disposing
    return disposing
  }

  /**
   * @internal
   */
  private _release(value: V): Promise<void> {
    const release = justDisposeAsync(value)
    const settled = release.then(noop, noop)
    this._releasing.add(settled)
    settled.then(() => {
      this._releasing.delete(settled)
    })
    return release
  }
}
