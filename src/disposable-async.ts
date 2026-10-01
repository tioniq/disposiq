import type {
  AsyncDisposableAwareCompat,
  AsyncDisposableLike,
  DisposableLike,
  DisposalOrder,
  IAsyncDisposable,
  IDisposable,
} from "./declarations"
import { AsyncDisposiq } from "./disposiq"
import { safeDisposableExceptionHandlerManager } from "./safe"
import { AsyncDisposableStore } from "./store-async"
import type { IntervalDisposable, TimeoutDisposable, TimerOptions } from "./timer"

/**
 * Options of an {@link AsyncDisposable}
 */
export interface AsyncDisposableOptions {
  /**
   * The order in which the registered disposables are disposed. Defaults to `fifo`, the order they were registered.
   */
  order?: DisposalOrder

  /**
   * Receives each error thrown during disposal. Without it, `dispose` rejects with the errors.
   */
  onError?: (e: unknown) => void
}

/**
 * AsyncDisposable is a base class for disposables whose cleanup is asynchronous: the async counterpart of
 * {@link Disposable}. Everything registered is disposed one after another, each awaited, when the object is disposed.
 * @example
 * class Connection extends AsyncDisposable {
 *   constructor(socket: Socket) {
 *     super({ order: "lifo" })
 *     this.addDisposable(() => socket.end())
 *     this.addTimeout(() => socket.destroy(), 30_000)
 *   }
 * }
 * await using connection = new Connection(socket)
 */
export abstract class AsyncDisposable
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat {
  private readonly _store: AsyncDisposableStore

  private readonly _onError: ((e: unknown) => void) | undefined

  constructor(options?: AsyncDisposableOptions) {
    super()
    this._store = new AsyncDisposableStore({ order: options?.order })
    this._onError = options?.onError
  }

  /**
   * Returns true if the object has been disposed. It becomes true as soon as dispose is called, before the registered
   * disposables have finished disposing.
   */
  get disposed(): boolean {
    return this._store.disposed
  }

  /**
   * Register a disposable object. The object will be disposed when the current object is disposed. If the current
   * object has already been disposed, the disposable is disposed at once.
   * @param t a disposable object
   * @protected inherited classes should use this method to register disposables
   * @returns the disposable object
   */
  protected register<T extends IDisposable | IAsyncDisposable>(t: T): T {
    this._settleLate(this._store.addOne(t))
    return t
  }

  /**
   * Wait for the disposable and register it. If the current object is disposed in the meantime, the disposable is
   * disposed as soon as it arrives, and the returned promise still resolves with it.
   * @param promiseOrAction a disposable, a promise of one, or a function that returns either
   * @returns the disposable object
   */
  protected async registerAsync<T extends IDisposable | IAsyncDisposable>(
    promiseOrAction: Promise<T> | (() => Promise<T>) | (() => T) | T,
  ): Promise<T> {
    const disposable =
      typeof promiseOrAction === "function"
        ? await promiseOrAction()
        : await promiseOrAction
    return this.register(disposable)
  }

  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  protected throwIfDisposed(message?: string): void {
    this._store.throwIfDisposed(message)
  }

  /**
   * Start a timeout that is cleared when the object is disposed. It is released once it has fired.
   * @param callback a callback to call when the timeout expires
   * @param timeout the number of milliseconds to wait before calling the callback
   * @param options timer options
   * @returns the timeout; disposing it clears the timeout
   */
  protected addTimeout(callback: () => void, timeout: number, options?: TimerOptions): TimeoutDisposable {
    return this._store.addTimeout(callback, timeout, options)
  }

  /**
   * Start an interval that is cleared when the object is disposed.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   * @param options timer options
   * @returns the interval; disposing it clears the interval
   */
  protected addInterval(callback: () => void, interval: number, options?: TimerOptions): IntervalDisposable {
    return this._store.addInterval(callback, interval, options)
  }

  /**
   * Add a disposable, or a function (sync or async) to call on dispose. If the object has already been disposed, it is
   * disposed at once.
   * @param disposable a disposable to add
   */
  addDisposable(disposable: AsyncDisposableLike | DisposableLike): void {
    this._settleLate(this._store.addOne(disposable))
  }

  /**
   * Add disposables. If the object has already been disposed, they are disposed at once.
   * @param disposables disposables to add
   */
  addDisposables(...disposables: (AsyncDisposableLike | DisposableLike)[]): void {
    this._settleLate(this._store.addAll(disposables))
  }

  /**
   * Dispose everything registered, one after another. Every disposable is disposed even if some of them reject; the
   * errors go to the `onError` option, or reject the returned promise without it (several errors are wrapped in an
   * AggregateError). Calls made while the disposal is in progress return a promise that settles with it.
   */
  dispose(): Promise<void> {
    const onError = this._onError
    return onError === undefined
      ? this._store.dispose()
      : this._store.disposeSafely(onError)
  }

  /**
   * Nobody awaits the disposal of something registered after the object was disposed, so its error goes to the
   * `onError` option, or to {@link safeDisposableExceptionHandlerManager} without it
   */
  private _settleLate(disposal: void | Promise<void>): void {
    if (!(disposal instanceof Promise)) {
      return
    }
    disposal.then(undefined, (e: unknown) => {
      const onError = this._onError
      if (onError === undefined) {
        safeDisposableExceptionHandlerManager.handle(e)
      } else {
        onError(e)
      }
    })
  }
}
