import {DisposableCompat, IDisposable} from "./declarations";
import {DisposableStore} from "./store";

/**
 * Disposable is a base class for disposables. It will dispose all added disposables when it is disposed.
 */
export abstract class Disposable implements DisposableCompat {
  /**
   * @internal
   */
  private readonly _store = new DisposableStore()

  /**
   * Returns true if the object has been disposed.
   */
  protected get disposed(): boolean {
    return this._store.disposed
  }

  /**
   * Register a disposable object. The object will be disposed when the current object is disposed.
   * @param t a disposable object
   * @protected inherited classes should use this method to register disposables
   * @returns the disposable object
   */
  protected register<T extends IDisposable>(t: T): T {
    this._store.addOne(t)
    return t
  }

  /**
   * Dispose the object. If the object has already been disposed, this is a no-op.
   * If the object has not been disposed, all disposables added to the object will be disposed.
   */
  dispose(): void {
    this._store.dispose()
  }

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose()
  }
}