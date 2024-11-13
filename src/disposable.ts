import type {
  DisposableCompat,
  DisposableLike,
  IDisposable,
} from "./declarations"
import { DisposableStore } from "./store"
import { Disposiq } from "./disposiq"

/**
 * Disposable is a base class for disposables. It will dispose all added disposables when it is disposed.
 */
export abstract class Disposable extends Disposiq implements DisposableCompat {
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
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   * @protected inherited classes can use this method to throw an exception if the object has been disposed
   */
  protected throwIfDisposed(message?: string): void {
    this._store.throwIfDisposed(message)
  }

  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposable a disposable to add
   */
  addDisposable(disposable: DisposableLike): void {
    this._store.addOne(disposable)
  }

  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   */
  addDisposables(...disposables: DisposableLike[]): void {
    this._store.addAll(disposables)
  }

  dispose(): void {
    this._store.dispose()
  }
}
