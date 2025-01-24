import { Disposiq } from "./disposiq"
import { toDisposable } from "./aliases"
import type { IAsyncDisposable, IDisposable } from "./declarations"

/**
 * Represents a disposable object that holds a weak reference to another object,
 * enabling efficient memory management.
 *
 * This class is particularly useful for scenarios where you want to associate
 * a disposable behavior with an object, but you don't want to prolong its
 * lifespan unnecessarily by holding a strong reference to it.
 *
 * The class ensures that the referenced object's `dispose` method is called
 * when disposing of the `WeakRefDisposable` instance, provided the referenced
 * object is still available.
 *
 * T must be a type that implements `IDisposable`, `IAsyncDisposable`, or is an
 * `AbortController`.
 */
export class WeakRefDisposable<
  T extends IDisposable | IAsyncDisposable | AbortController,
> extends Disposiq {
  /**
   * @internal
   */
  private readonly _value: WeakRef<T>

  /**
   * @internal
   */
  private _disposed = false

  constructor(value: T | WeakRef<T>) {
    super()
    this._value = value instanceof WeakRef ? value : new WeakRef<T>(value)
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    const value = this._value.deref()
    if (!value) {
      return
    }
    toDisposable(value).dispose()
  }
}
