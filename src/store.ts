import {DisposableAwareCompat, DisposableLike, IDisposable, IDisposablesContainer} from "./declarations";
import {DisposableAction} from "./action";
import {disposeAll, disposeAllUnsafe} from "./dispose-batch";
import {Disposiq} from "./disposiq";
import {ObjectDisposedException} from "./exception";

/**
 * DisposableStore is a container for disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
export class DisposableStore extends Disposiq implements IDisposablesContainer, DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _disposables: IDisposable[]

  /**
   * @internal
   */
  private _disposed: boolean = false

  constructor() {
    super()
    this._disposables = new Array<IDisposable>()
  }

  /**
   * Returns true if the object has been disposed.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   */
  add(...disposables: DisposableLike[]): void {
    this.addAll(disposables)
  }

  /**
   * Adds disposables to the container. If the container has already been disposed, the disposables will be disposed.
   * @param disposables Disposables to add.
   */
  addAll(disposables: DisposableLike[]): void {
    if (!disposables || disposables.length === 0) {
      return
    }
    if (this._disposed) {
      for (const disposable of disposables) {
        if (!disposable) {
          continue
        }
        if (typeof disposable === "function") {
          disposable()
        } else {
          disposable.dispose()
        }
      }
      return
    }
    for (let i = 0; i < disposables.length; i++) {
      const disposable = disposables[i]
      if (!disposable) {
        continue
      }
      this._disposables.push(typeof disposable === "function" ? new DisposableAction(disposable) : disposable)
    }
  }

  /**
   * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
   * @param disposable a disposable to add
   * @returns the disposable object
   */
  addOne(disposable: DisposableLike): void {
    if (!disposable) {
      return
    }
    if (this._disposed) {
      if (typeof disposable === "function") {
        disposable()
      } else {
        disposable.dispose()
      }
      return
    }
    if (typeof disposable === "function") {
      disposable = new DisposableAction(disposable)
    }
    this._disposables.push(disposable)
  }

  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will be disposed.
   * @param disposable a disposable to remove
   * @returns true if the disposable was found and removed
   */
  remove(disposable: IDisposable): boolean {
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
  addTimeout(callback: () => void, timeout: number): void;

  /**
   * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
   * @param timeout a timeout handle
   */
  addTimeout(timeout: ReturnType<typeof setTimeout> | number): void;

  /**
   * @internal
   */
  addTimeout(callbackOrTimeout: (() => void) | ReturnType<typeof setTimeout> | number, timeout?: number | undefined): void {
    if (typeof callbackOrTimeout === "function") {
      const handle = setTimeout(callbackOrTimeout, timeout)
      this.add(() => clearTimeout(handle))
      return
    }
    this.add(() => clearTimeout(callbackOrTimeout))
  }

  /**
   * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   */
  addInterval(callback: () => void, interval: number): void;

  /**
   * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
   * @param interval an interval handle
   */
  addInterval(interval: ReturnType<typeof setInterval> | number): void;

  /**
   * @internal
   */
  addInterval(callbackOrInterval: (() => void) | ReturnType<typeof setInterval> | number, interval?: number | undefined): void {
    if (typeof callbackOrInterval === "function") {
      const handle = setInterval(callbackOrInterval, interval)
      this.add(() => clearInterval(handle))
      return
    }
    this.add(() => clearInterval(callbackOrInterval))
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
   * Dispose the store. If the store has already been disposed, this is a no-op.
   * If the store has not been disposed, all disposables added to the store will be disposed.
   */
  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    disposeAllUnsafe(this._disposables)
  }

  /**
   * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
   * store. The store can continue to be used after this method is called. This method is useful when the store is
   * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
   * this method will safely add the disposable to the store without disposing it immediately.
   */
  disposeCurrent(): void {
    disposeAll(this._disposables)
  }

  /**
   * Create a disposable store from an array of values. The values are mapped to disposables using the provided
   * mapper function.
   * @param values an array of values
   * @param mapper a function that maps a value to a disposable
   */
  static from<T>(values: T[], mapper: (value: T) => DisposableLike): DisposableStore

  /**
   * Create a disposable store from an array of disposables.
   * @param disposables an array of disposables
   * @returns a disposable store containing the disposables
   */
  static from(disposables: DisposableLike[]): DisposableStore

  static from<T>(disposables: DisposableLike[] | T[], mapper?: (value: T) => DisposableLike): DisposableStore {
    if (typeof mapper === "function") {
      const store = new DisposableStore()
      store.addAll((disposables as T[]).map(mapper))
      return store
    }
    const store = new DisposableStore()
    store.addAll(disposables as DisposableLike[])
    return store
  }
}
