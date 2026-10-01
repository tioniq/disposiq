import { toDisposable } from "./aliases"
import type { CanBeDisposable, DisposableAware, IDisposable, } from "./declarations"
import { justDisposeAll } from "./dispose-batch"
import { Disposiq } from "./disposiq"

/**
 * A key-value store that stores disposable values. When the store is disposed, all the values will be disposed as well
 * @typeParam K the key type
 * @typeParam V the value type. With the default `IDisposable`, `set` accepts anything disposable-like (functions,
 * AbortControllers, ...) and stores it converted to an `IDisposable`; with a narrower type, `set` accepts and `get`
 * returns exactly that type
 */
export class DisposableMapStore<K, V extends IDisposable = IDisposable>
  extends Disposiq
  implements DisposableAware, Iterable<[K, V]> {
  /**
   * @internal
   */
  private readonly _map = new Map<K, V>()

  /**
   * @internal
   */
  private _disposed = false

  /**
   * Get the disposed state of the store
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
   * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed
   * (unless it is the same value).
   * If the store is disposed, the value will be disposed immediately
   * @param key the key
   * @param value the disposable value
   */
  set(key: K, value: IDisposable extends V ? CanBeDisposable : V): void {
    const disposable = toDisposable(value as CanBeDisposable) as V
    if (this._disposed) {
      disposable.dispose()
      return
    }
    const prev = this._map.get(key)
    if (prev === disposable) {
      return
    }
    this._map.set(key, disposable)
    prev?.dispose()
  }

  /**
   * Get the disposable value for the key
   * @param key the key
   * @returns the disposable value or undefined if the key is not found
   */
  get(key: K): V | undefined {
    if (this._disposed) {
      return
    }
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
   * Delete the disposable value for the key
   * @param key the key
   * @returns true if the key was found and the value was deleted, false otherwise
   */
  delete(key: K): boolean {
    if (this._disposed) {
      return false
    }
    const disposable = this._map.get(key)
    if (!disposable) {
      return false
    }
    this._map.delete(key)
    disposable.dispose()
    return true
  }

  /**
   * Remove the disposable value for the key and return it. The disposable value will not be disposed
   * @param key the key
   * @returns the disposable value or undefined if the key is not found
   */
  extract(key: K): V | undefined {
    if (this._disposed) {
      return
    }
    const disposable = this._map.get(key)
    if (!disposable) {
      return
    }
    this._map.delete(key)
    return disposable
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    const values = Array.from(this._map.values())
    this._map.clear()
    justDisposeAll(values)
  }
}
