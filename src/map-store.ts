import { toDisposable } from "./aliases"
import type { CanBeDisposable, DisposableAware, IDisposable, } from "./declarations"
import { Disposiq } from "./disposiq"

/**
 * A key-value store that stores disposable values. When the store is disposed, all the values will be disposed as well
 */
export class DisposableMapStore<K> extends Disposiq implements DisposableAware {
  /**
   * @internal
   */
  private readonly _map = new Map<K, IDisposable>()

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
   * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed.
   * If the store is disposed, the value will be disposed immediately
   * @param key the key
   * @param value the disposable value
   */
  set(key: K, value: CanBeDisposable): void {
    const disposable = toDisposable(value)
    if (this._disposed) {
      disposable.dispose()
      return
    }
    const prev = this._map.get(key)
    this._map.set(key, disposable)
    prev?.dispose()
  }

  /**
   * Get the disposable value for the key
   * @param key the key
   * @returns the disposable value or undefined if the key is not found
   */
  get(key: K): IDisposable | undefined {
    if (this._disposed) {
      return
    }
    return this._map.get(key)
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
  extract(key: K): IDisposable | undefined {
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
    for (const value of this._map.values()) {
      value.dispose()
    }
    this._map.clear()
  }
}
