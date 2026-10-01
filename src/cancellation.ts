import { DisposableAction } from "./action"
import type { CancellationTokenLike, DisposableAware, DisposableAwareCompat } from "./declarations";
import { Disposiq } from "./disposiq";
import { emptyDisposable } from "./empty"
import { ObjectDisposedException, OperationCancelledException } from "./exception";
import { isDisposable } from "./is"
import { safeDisposableExceptionHandlerManager } from "./safe"
import { TimeoutDisposable, type TimerOptions } from "./timer"
import { throwCollected } from "./utils/errors"

/**
 * Converts a cancellation token into a disposable object that can be used
 * to manage and respond to cancellation requests.
 *
 * @param {CancellationTokenLike} token - The cancellation token to be wrapped
 * into a disposable instance.
 * @return {Disposiq & DisposableAware} A disposable object that represents
 * the behavior associated with the provided cancellation token.
 */
export function disposableFromCancellationToken(
  token: CancellationTokenLike
): Disposiq & DisposableAware {
  return new CancellationTokenDisposable(token)
}

const customDisposeGetter = Object.freeze(() => false)

/**
 * Represents a disposable object that manages cancellation token.
 * This class provides an abstraction for working with cancellation tokens
 * and exposes a mechanism to track if it has been disposed.
 * Implements the DisposableAware interface.
 */
export class CancellationTokenDisposable extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private readonly _token: CancellationTokenLike

  /**
   * @internal
   */
  private _disposedGetter: () => boolean

  constructor(token: CancellationTokenLike) {
    super()
    if (token == null) {
      throw new Error("Invalid token")
    }
    this._token = token
    const isCancelledType = typeof token.isCancelled
    if (isCancelledType === "function") {
      this._disposedGetter = () => (token.isCancelled as () => boolean).call(token)
    } else if (isCancelledType === "boolean") {
      this._disposedGetter = () => token.isCancelled as boolean
    } else if (typeof token.onCancel === "function") {
      let cancelled = false
      token.onCancel(() => {
        cancelled = true
      })
      this._disposedGetter = () => cancelled
    } else {
      this._disposedGetter = customDisposeGetter
    }
  }

  get disposed(): boolean {
    return this._disposedGetter()
  }

  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message?: string): void {
    if (this.disposed) {
      throw new ObjectDisposedException(message)
    }
  }

  dispose() {
    if (this._disposedGetter === customDisposeGetter) {
      this._disposedGetter = () => true
    }
    this._token.cancel()
  }
}

/**
 * A cancellation token: `cancel()` marks it cancelled and calls the callbacks registered with `onCancel`.
 * Disposing a token does not cancel it: it detaches the token from what would cancel it on its own (the timer of
 * {@link timeoutToken}, the parents of {@link mergeTokens}), so `using` releases them at the end of a scope. Use
 * {@link disposableFromCancellationToken} for a disposable that cancels the token.
 * @example
 * using deadline = timeoutToken(30_000)
 * await download(url, deadline)
 */
export class CancellationToken extends Disposiq implements CancellationTokenLike {
  /**
   * @internal
   */
  private _cancelled = false

  /**
   * @internal
   */
  private _callbacks: (() => void)[] = []

  /**
   * Detaches the token from its timer or parents
   * @internal
   */
  private _detach: (() => void) | undefined

  /**
   * Create a token that is cancelled after the given time. Disposing the token clears the timer without cancelling
   * it. An error thrown by a callback when the timer fires goes to {@link safeDisposableExceptionHandlerManager}.
   * @param ms the time in milliseconds
   * @param options timer options
   */
  static timeout(ms: number, options?: TimerOptions): CancellationToken {
    const token = new CancellationToken()
    const timeout = new TimeoutDisposable(() => {
      try {
        token.cancel()
      } catch (e) {
        safeDisposableExceptionHandlerManager.handle(e)
      }
    }, ms, options)
    token._detach = () => timeout.dispose()
    return token
  }

  /**
   * Create a token that is cancelled when any of the given tokens is cancelled, or by its own `cancel()`. It is
   * created cancelled if one of them is already cancelled. Disposing it unsubscribes it from the given tokens without
   * cancelling it. Tokens without an `onCancel` method are only checked once, when the token is created.
   * @param tokens the tokens to follow; null and undefined are skipped
   */
  static merge(...tokens: (CancellationTokenLike | null | undefined)[]): CancellationToken {
    const token = new CancellationToken()
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] && isTokenCancelled(tokens[i])) {
        token._cancelled = true
        return token
      }
    }
    const subscriptions: (() => void)[] = []
    let following = true
    const unsubscribe = () => {
      following = false
      const current = subscriptions.splice(0)
      for (let i = 0; i < current.length; i++) {
        current[i]()
      }
    }
    token._detach = unsubscribe
    const cancel = () => {
      if (following) {
        token.cancel()
      }
    }
    for (let i = 0; i < tokens.length && !token._cancelled; i++) {
      const parent = tokens[i]
      if (!parent || typeof parent.onCancel !== "function") {
        continue
      }
      const subscription: unknown = parent.onCancel(cancel)
      if (isDisposable(subscription)) {
        subscriptions.push(() => subscription.dispose())
      } else if (typeof parent.removeCallback === "function") {
        subscriptions.push(() => parent.removeCallback(cancel))
      }
    }
    if (token._cancelled) {
      // a parent that cancelled the token from inside onCancel was subscribed after the detach ran
      unsubscribe()
    }
    return token
  }

  /**
   * Returns true if the token has been cancelled
   */
  isCancelled(): boolean {
    return this._cancelled
  }

  /**
   * Throw an {@link OperationCancelledException} if the token has been cancelled
   * @param message the message to include in the exception
   */
  throwIfCancelled(message?: string): void {
    if (this._cancelled) {
      throw new OperationCancelledException(message)
    }
  }

  /**
   * Register a callback to call when the token is cancelled. On a cancelled token the callback is called at once.
   * @param callback the callback
   * @returns a disposable that unregisters the callback
   */
  onCancel(callback: () => void): Disposiq {
    if (this._cancelled) {
      callback()
      return emptyDisposable
    }
    this._callbacks.push(callback)
    return new DisposableAction(() => {
      this.removeCallback(callback)
    })
  }

  /**
   * Unregister a callback registered with `onCancel`
   * @param callback the callback
   */
  removeCallback(callback: () => void): void {
    const index = this._callbacks.indexOf(callback)
    if (index !== -1) {
      this._callbacks.splice(index, 1)
    }
  }

  /**
   * Cancel the token and call the registered callbacks in the order they were registered. Every callback is called
   * even if some of them throw; the error is rethrown afterwards (several errors are wrapped in an AggregateError).
   * Cancelling more than once is a no-op.
   */
  cancel(): void {
    if (this._cancelled) {
      return
    }
    this._cancelled = true
    this._release()
    const callbacks = this._callbacks
    this._callbacks = []
    let errors: unknown[] | undefined
    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i]()
      } catch (e) {
        if (errors === undefined) {
          errors = [e]
        } else {
          errors.push(e)
        }
      }
    }
    throwCollected(errors)
  }

  /**
   * Detach the token from its timer or parent tokens without cancelling it. The token keeps its state and its
   * callbacks, and `cancel()` still works.
   */
  dispose(): void {
    this._release()
  }

  /**
   * @internal
   */
  private _release(): void {
    const detach = this._detach
    if (detach === undefined) {
      return
    }
    this._detach = undefined
    detach()
  }
}

function isTokenCancelled(token: CancellationTokenLike): boolean {
  const isCancelled = token.isCancelled
  if (typeof isCancelled === "function") {
    return isCancelled.call(token)
  }
  return isCancelled === true
}

/**
 * Create a token that is cancelled after the given time. Disposing the token clears the timer without cancelling it,
 * so `using deadline = timeoutToken(ms)` leaves no timer behind at the end of the scope.
 * @param ms the time in milliseconds
 * @param options timer options
 */
export function timeoutToken(ms: number, options?: TimerOptions): CancellationToken {
  return CancellationToken.timeout(ms, options)
}

/**
 * Create a token that is cancelled when any of the given tokens is cancelled, or by its own `cancel()`. Disposing it
 * unsubscribes it from the given tokens without cancelling it.
 * @param tokens the tokens to follow; null and undefined are skipped
 */
export function mergeTokens(...tokens: (CancellationTokenLike | null | undefined)[]): CancellationToken {
  return CancellationToken.merge(...tokens)
}

/**
 * Register a callback with any token that has an `onCancel` method, and return a disposable that unregisters it.
 * After disposal the callback is never called, even by a token that cannot unregister callbacks. Whether a token that
 * is already cancelled calls the callback is up to the token.
 * @param token the token
 * @param callback the callback to call when the token is cancelled
 * @returns a disposable that unregisters the callback
 */
export function onCancel(
  token: CancellationTokenLike & Required<Pick<CancellationTokenLike, "onCancel">>,
  callback: () => void,
): Disposiq {
  let active = true
  const listener = () => {
    if (active) {
      callback()
    }
  }
  const subscription: unknown = token.onCancel(listener)
  return new DisposableAction(() => {
    active = false
    if (isDisposable(subscription)) {
      subscription.dispose()
    } else if (typeof token.removeCallback === "function") {
      token.removeCallback(listener)
    }
  })
}
