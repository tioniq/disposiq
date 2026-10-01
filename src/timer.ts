import type { DisposableAwareCompat } from "./declarations"
import { Disposiq } from "./disposiq"

/**
 * Options for the timers created by the library
 */
export interface TimerOptions {
  /**
   * The timer does not keep the process alive. Applies where the timer handle has an `unref` method (Node.js, Bun,
   * Deno); ignored elsewhere.
   */
  unref?: boolean
}

type TimerHandle = ReturnType<typeof setTimeout>

function callHandle(handle: TimerHandle, method: "ref" | "unref"): void {
  const fn = (handle as unknown as Record<string, unknown>)[method]
  if (typeof fn === "function") {
    fn.call(handle)
  }
}

/**
 * A pending timeout. Disposing it clears the timeout.
 * @example
 * const timeout = new TimeoutDisposable(() => console.log("fired"), 1000, { unref: true })
 * timeout.dispose() // the callback is never called
 */
export class TimeoutDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _handle: TimerHandle

  /**
   * @internal
   */
  private _disposed = false

  /**
   * @internal
   */
  private _fired = false

  constructor(callback: () => void, ms: number, options?: TimerOptions) {
    super()
    this._handle = setTimeout(() => {
      this._fired = true
      this._disposed = true
      callback()
    }, ms)
    if (options?.unref) {
      callHandle(this._handle, "unref")
    }
  }

  /**
   * Returns true once the timeout has fired or has been disposed
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Returns true if the callback has been called
   */
  get fired(): boolean {
    return this._fired
  }

  /**
   * Let the process exit while the timeout is pending (where the platform supports it)
   */
  unref(): this {
    callHandle(this._handle, "unref")
    return this
  }

  /**
   * Keep the process alive while the timeout is pending (the default)
   */
  ref(): this {
    callHandle(this._handle, "ref")
    return this
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    clearTimeout(this._handle)
  }
}

/**
 * A running interval. Disposing it clears the interval.
 */
export class IntervalDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _handle: ReturnType<typeof setInterval>

  /**
   * @internal
   */
  private _disposed = false

  constructor(callback: () => void, ms: number, options?: TimerOptions) {
    super()
    this._handle = setInterval(callback, ms)
    if (options?.unref) {
      callHandle(this._handle, "unref")
    }
  }

  /**
   * Returns true if the interval has been disposed
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Let the process exit while the interval is running (where the platform supports it)
   */
  unref(): this {
    callHandle(this._handle, "unref")
    return this
  }

  /**
   * Keep the process alive while the interval is running (the default)
   */
  ref(): this {
    callHandle(this._handle, "ref")
    return this
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    clearInterval(this._handle)
  }
}
