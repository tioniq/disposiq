import type {
  AsyncDisposableAwareCompat,
  AsyncDisposableLike,
  DisposableLike,
  DisposalOrder,
} from "./declarations"
import {
  disposeAllAsync,
  disposeAllSafelyAsync,
  disposeAllUnsafeAsync,
  justDisposeAllAsync,
  justDisposeAsync,
} from "./dispose-batch"
import { AsyncDisposiq } from "./disposiq"
import { ObjectDisposedException } from "./exception"
import type { DisposableStoreOptions } from "./store"
import type { IntervalDisposable, TimeoutDisposable, TimerOptions } from "./timer"
import { onSettled, resolvedPromise } from "./utils/disposing"
import { noop } from "./utils/noop"
import { createOwnedInterval, createOwnedTimeout } from "./utils/owned-timers"

/**
 * Options of an async disposable store
 */
export interface AsyncDisposableStoreOptions extends DisposableStoreOptions {
  /**
   * When true, disposals never overlap: each `disposeCurrent` starts after the previous one has finished (and its
   * promise settles after that), and `dispose` waits for a `disposeCurrent` in progress. Defaults to false.
   * An item must not await a `disposeCurrent` or `dispose` of its own serial store while it is being disposed: that
   * call waits for the disposal the item is part of.
   */
  serial?: boolean
}

/**
 * AsyncDisposableStore is a container for async disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
export class AsyncDisposableStore
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _disposables: (AsyncDisposableLike | DisposableLike)[] = []

  /**
   * @internal
   */
  private _disposed = false

  /**
   * The disposal in progress, shared by concurrent dispose/disposeSafely calls
   * @internal
   */
  private _disposing: Promise<void> | undefined

  /**
   * The latest disposeCurrent round of a serial store, settled when that round has finished; never rejects
   * @internal
   */
  private _round: Promise<void> | undefined

  /**
   * The order in which the store disposes its items
   */
  readonly order: DisposalOrder

  /**
   * Whether disposals wait for the ones started before them, see {@link AsyncDisposableStoreOptions.serial}
   */
  readonly serial: boolean

  constructor(options?: AsyncDisposableStoreOptions) {
    super()
    this.order = options?.order === "lifo" ? "lifo" : "fifo"
    this.serial = options?.serial === true
  }

  /**
   * Returns true if the object has been disposed. It becomes true as soon as dispose or disposeSafely is called,
   * before the disposables have finished disposing.
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
   * Add a timeout to the store. The store clears it when disposed, and it leaves the store once it has fired. If the
   * store has already been disposed, the callback is never called.
   * @param callback a callback to call when the timeout expires
   * @param timeout the number of milliseconds to wait before calling the callback
   * @param options timer options
   * @returns the timeout; disposing it clears the timeout
   */
  addTimeout(callback: () => void, timeout: number, options?: TimerOptions): TimeoutDisposable {
    return createOwnedTimeout(this, (t) => this._disposables.push(t), callback, timeout, options)
  }

  /**
   * Add an interval to the store. The store clears it when disposed. If the store has already been disposed, the
   * interval is cleared at once.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   * @param options timer options
   * @returns the interval; disposing it clears the interval
   */
  addInterval(callback: () => void, interval: number, options?: TimerOptions): IntervalDisposable {
    return createOwnedInterval(this, (t) => this._disposables.push(t), callback, interval, options)
  }

  /**
   * Dispose all disposables in the store. The store does not become disposed. Every disposable is disposed even if
   * some of them reject; the returned promise then rejects with the error (several errors are wrapped in an
   * AggregateError). On a serial store the round starts after the previous one has finished, and on a disposed
   * serial store the returned promise settles when the disposal has finished.
   */
  disposeCurrent(): Promise<void> {
    if (this._disposed) {
      return this.serial ? this._whenDisposed() : Promise.resolve()
    }
    if (!this.serial) {
      return disposeAllAsync(this._ordered())
    }
    const items = this._ordered().splice(0)
    return this._enqueueRound(() => disposeAllUnsafeAsync(items))
  }

  /**
   * Dispose all disposables in the store like {@link disposeCurrent}, passing each error to the callback instead of
   * rejecting. The store does not become disposed.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeCurrentSafely(onErrorCallback?: (e: unknown) => void): Promise<void> {
    if (this._disposed) {
      return this.serial ? this._whenDisposed() : resolvedPromise
    }
    const items = this._ordered().splice(0)
    if (!this.serial) {
      return disposeAllSafelyAsync(items, onErrorCallback)
    }
    return this._enqueueRound(() => disposeAllSafelyAsync(items, onErrorCallback))
  }

  /**
   * Dispose all disposables in the store safely. The store becomes disposed immediately. Errors are passed to the
   * callback and never reject the returned promise. If a disposal is already in progress, the returned promise
   * settles when it completes.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeSafely(onErrorCallback?: (e: unknown) => void): Promise<void> {
    if (this._disposed) {
      return this._whenDisposed()
    }
    this._disposed = true
    const items = this._ordered()
    return this._track(
      this._afterRound(() => disposeAllSafelyAsync(items, onErrorCallback)),
    )
  }

  /**
   * Dispose the store and all disposables in the store's {@link order}. The store becomes disposed immediately. Every
   * disposable is disposed even if some of them reject; the returned promise then rejects with the error (several
   * errors are wrapped in an AggregateError). Calls made while the disposal is in progress return the same promise,
   * later calls resolve immediately. On a serial store the disposal starts after a `disposeCurrent` in progress.
   */
  dispose(): Promise<void> {
    if (this._disposed) {
      return this._disposing ?? resolvedPromise
    }
    this._disposed = true
    const items = this._ordered()
    return this._track(this._afterRound(() => disposeAllUnsafeAsync(items)))
  }

  /**
   * The items, arranged in the order they are disposed in
   * @internal
   */
  private _ordered(): (AsyncDisposableLike | DisposableLike)[] {
    return this.order === "lifo" ? this._disposables.reverse() : this._disposables
  }

  /**
   * Settles when the disposal has finished; never rejects
   * @internal
   */
  private _whenDisposed(): Promise<void> {
    const disposing = this._disposing
    return disposing === undefined ? resolvedPromise : disposing.then(noop, noop)
  }

  /**
   * Run the action once the latest disposeCurrent round has finished (at once if there is none)
   * @internal
   */
  private _afterRound(action: () => Promise<void>): Promise<void> {
    const previous = this._round
    return previous === undefined ? action() : previous.then(action)
  }

  /**
   * @internal
   */
  private _enqueueRound(action: () => Promise<void>): Promise<void> {
    const round = this._afterRound(action)
    const settled = round.then(noop, noop)
    this._round = settled
    settled.then(() => {
      if (this._round === settled) {
        this._round = undefined
      }
    })
    return round
  }

  /**
   * @internal
   */
  private _track(promise: Promise<void>): Promise<void> {
    const disposing = onSettled(promise, () => {
      this._disposing = undefined
    })
    this._disposing = disposing
    return disposing
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
