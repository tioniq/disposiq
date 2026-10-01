import type { AsyncDisposableAwareCompat, IAsyncDisposable, IDisposable, } from "./declarations"
import { justDisposeAsync } from "./dispose-batch"
import { AsyncDisposiq } from "./disposiq"
import { safeDisposableExceptionHandlerManager } from "./safe"
import { onSettled, resolvedPromise } from "./utils/disposing"
import { noop } from "./utils/noop"

/**
 * A container for a disposable that is disposed asynchronously: the async counterpart of {@link DisposableContainer}.
 * Setting a new value disposes the previous one, and the returned promise settles when that disposal has finished.
 * @typeParam T the value type
 * @example
 * const connection = new AsyncDisposableContainer<Connection>()
 * await connection.set(await Connection.open()) // closes the previous connection, if any
 * await connection.dispose() // closes the current one
 */
export class AsyncDisposableContainer<T extends IAsyncDisposable | IDisposable = IAsyncDisposable | IDisposable>
  extends AsyncDisposiq
  implements AsyncDisposableAwareCompat {
  /**
   * @internal
   */
  private _disposable: T | undefined

  /**
   * Disposals of replaced values that are still in progress; they never reject
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

  constructor(disposable: T | null | undefined = undefined) {
    super()
    this._disposable = disposable == undefined ? undefined : disposable
  }

  /**
   * Returns true if the container is disposed. It becomes true as soon as dispose is called, before the current value
   * has finished disposing.
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Returns the current disposable object
   */
  get disposable(): T | undefined {
    return this._disposable
  }

  /**
   * Set the new disposable and dispose the old one. Setting the current disposable again does not dispose it. If the
   * container is disposed, the new disposable is disposed instead.
   * @param disposable a new disposable to set
   * @returns a promise that settles when the old (or rejected) disposable has been disposed, and rejects if that fails
   */
  set(disposable: T | null | undefined): Promise<void> {
    const value = disposable == undefined ? undefined : disposable
    if (this._disposed) {
      return value === undefined ? resolvedPromise : this._release(value)
    }
    const prev = this._disposable
    this._disposable = value
    return prev === undefined || prev === value
      ? resolvedPromise
      : this._release(prev)
  }

  /**
   * Replace the disposable with a new one. Does not dispose the old one. If the container is disposed, the new
   * disposable is disposed, and an error of that disposal goes to {@link safeDisposableExceptionHandlerManager}
   * @param disposable a new disposable to replace the old one
   * @returns the old disposable object or undefined if the container is disposed
   */
  replace(disposable: T | null | undefined): T | undefined {
    const value = disposable == undefined ? undefined : disposable
    if (this._disposed) {
      if (value !== undefined) {
        this._release(value).then(undefined, (e: unknown) =>
          safeDisposableExceptionHandlerManager.handle(e),
        )
      }
      return undefined
    }
    const prev = this._disposable
    this._disposable = value
    return prev
  }

  /**
   * Dispose only the current disposable object, leaving the container empty and usable
   * @returns a promise that settles when the disposable has been disposed, and rejects if that fails
   */
  disposeCurrent(): Promise<void> {
    const disposable = this._disposable
    if (disposable === undefined) {
      return resolvedPromise
    }
    this._disposable = undefined
    return this._release(disposable)
  }

  /**
   * Dispose the container and the current disposable, after the disposals of replaced values that are already in
   * progress. The returned promise rejects if disposing the current disposable fails. Calls made while the disposal is
   * in progress return the same promise, later calls resolve immediately.
   */
  dispose(): Promise<void> {
    if (this._disposed) {
      return this._disposing ?? resolvedPromise
    }
    this._disposed = true
    const disposable = this._disposable
    this._disposable = undefined
    const running = Array.from(this._releasing)
    const disposing = onSettled(
      Promise.all(running).then(() => justDisposeAsync(disposable)),
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
  private _release(value: T): Promise<void> {
    const release = justDisposeAsync(value)
    const settled = release.then(noop, noop)
    this._releasing.add(settled)
    settled.then(() => {
      this._releasing.delete(settled)
    })
    return release
  }
}
