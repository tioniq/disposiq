import {
  CancellationToken,
  CancellationTokenDisposable,
  type CancellationTokenLike,
  disposableFromCancellationToken,
  mergeTokens,
  onCancel,
  OperationCancelledException,
  safeDisposableExceptionHandlerManager,
  timeoutToken,
} from "../src";

describe('cancellation token', () => {
  it("Dispose a cancellation token", () => {
    const token = createCancellationToken()
    const disposable = disposableFromCancellationToken(token)
    expect(token.isCancelled()).toBe(false)
    disposable.dispose()
    expect(token.isCancelled()).toBe(true)
  })

  it("Dispose check disposed when cancellation token disposed internally", () => {
    const token = createCancellationToken()
    const disposable = disposableFromCancellationToken(token)
    expect(disposable.disposed).toBe(false)
    token.cancel()
    expect(disposable.disposed).toBe(true)
  })

  it("Dispose check boolean isCancelled in token", () => {
    const token: CancellationTokenLike = {
      isCancelled: false,
      cancel() {
        this.isCancelled = true
      }
    }
    const disposable = disposableFromCancellationToken(token)
    expect(disposable.disposed).toBe(false)
    expect(token.isCancelled).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
    expect(token.isCancelled).toBe(true)
  })

  it("Dispose check disposed on callback when token disposed internally", () => {
    let cancelled = false
    const callbacks = new Array<() => void>()
    const token: CancellationTokenLike = {
      cancel() {
        if (cancelled) {
          return
        }
        cancelled = true
        for (const callback of callbacks) {
          callback()
        }
      },
      onCancel(callback: () => void) {
        callbacks.push(callback)
      }
    }
    const disposable = disposableFromCancellationToken(token)
    expect(disposable.disposed).toBe(false)
    token.cancel()
    expect(disposable.disposed).toBe(true)
  })

  it("Should throw when token is null or undefined", () => {
    expect(() => disposableFromCancellationToken(null)).toThrow()
    expect(() => disposableFromCancellationToken(undefined)).toThrow()
  })

  it("Should use fallback getter", () => {
    let cancelled = false
    const token: CancellationTokenLike = {
      cancel() {
        cancelled = true
      }
    }
    const disposable = disposableFromCancellationToken(token)
    expect(disposable.disposed).toBe(false)
    expect(cancelled).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
    expect(cancelled).toBe(true)
  })

  it("Should throw if disposed", () => {
    const token = createCancellationToken()
    const disposable = new CancellationTokenDisposable(token)
    expect(() => disposable.throwIfDisposed()).not.toThrow()
    disposable.dispose()
    expect(() => disposable.throwIfDisposed()).toThrow()
  })
})

function createCancellationToken() {
  let cancelled = false
  const callbacks: (() => void)[] = []
  return {
    isCancelled: () => cancelled,
    cancel: () => {
      cancelled = true
      for (const callback of callbacks) {
        callback()
      }
    },
    onCancel: (callback: () => void) => {
      callbacks.push(callback)
    }
  }
}
describe("cancellation token class", () => {
  it("calls the callbacks once, in the order they were registered", () => {
    const token = new CancellationToken()
    const log: string[] = []
    token.onCancel(() => log.push("a"))
    token.onCancel(() => log.push("b"))
    expect(token.isCancelled()).toBe(false)
    token.cancel()
    token.cancel()
    expect(token.isCancelled()).toBe(true)
    expect(log).toEqual(["a", "b"])
  })

  it("calls a callback registered after cancellation at once", () => {
    const token = new CancellationToken()
    token.cancel()
    const callback = jest.fn()
    const subscription = token.onCancel(callback)
    expect(callback).toHaveBeenCalledTimes(1)
    subscription.dispose()
  })

  it("unregisters a callback by disposing the subscription or with removeCallback", () => {
    const token = new CancellationToken()
    const first = jest.fn()
    const second = jest.fn()
    const kept = jest.fn()
    token.onCancel(first).dispose()
    token.onCancel(second)
    token.removeCallback(second)
    token.removeCallback(jest.fn())
    token.onCancel(kept)
    token.cancel()
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    expect(kept).toHaveBeenCalledTimes(1)
  })

  it("calls every callback past an error and rethrows it", () => {
    const token = new CancellationToken()
    const after = jest.fn()
    token.onCancel(() => {
      throw new Error("a")
    })
    token.onCancel(after)
    token.onCancel(() => {
      throw new Error("b")
    })
    let thrown: unknown
    try {
      token.cancel()
    } catch (e) {
      thrown = e
    }
    expect(after).toHaveBeenCalledTimes(1)
    expect((thrown as { errors: Error[] }).errors.map((e) => e.message)).toEqual(["a", "b"])
    expect(token.isCancelled()).toBe(true)
  })

  it("throws OperationCancelledException once cancelled", () => {
    const token = new CancellationToken()
    expect(() => token.throwIfCancelled()).not.toThrow()
    token.cancel()
    expect(() => token.throwIfCancelled()).toThrow(OperationCancelledException)
    expect(() => token.throwIfCancelled()).toThrow("Operation cancelled")
    expect(() => token.throwIfCancelled("Download cancelled")).toThrow("Download cancelled")
  })

  it("is not cancelled by dispose", () => {
    const token = new CancellationToken()
    const callback = jest.fn()
    token.onCancel(callback)
    token.dispose()
    expect(token.isCancelled()).toBe(false)
    token.cancel()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("is cancelled through disposableFromCancellationToken", () => {
    const token = new CancellationToken()
    const disposable = disposableFromCancellationToken(token)
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(token.isCancelled()).toBe(true)
    expect(disposable.disposed).toBe(true)
  })
})

describe("timeout token", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("is cancelled after the time has passed", () => {
    const token = timeoutToken(100)
    const callback = jest.fn()
    token.onCancel(callback)
    jest.advanceTimersByTime(99)
    expect(token.isCancelled()).toBe(false)
    jest.advanceTimersByTime(1)
    expect(token.isCancelled()).toBe(true)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("clears the timer without cancelling when disposed", () => {
    const token = timeoutToken(100)
    token.dispose()
    token.dispose()
    jest.advanceTimersByTime(100)
    expect(token.isCancelled()).toBe(false)
    expect(jest.getTimerCount()).toBe(0)
  })

  it("clears the timer at the end of a 'using' scope", () => {
    let token: CancellationToken
    {
      using deadline = timeoutToken(100)
      token = deadline
    }
    expect(jest.getTimerCount()).toBe(0)
    jest.advanceTimersByTime(100)
    expect(token.isCancelled()).toBe(false)
  })

  it("clears the timer when cancelled early", () => {
    const token = timeoutToken(100)
    token.cancel()
    expect(jest.getTimerCount()).toBe(0)
  })

  it("passes a callback error to the safe exception handler when the timer fires", () => {
    const errors: unknown[] = []
    safeDisposableExceptionHandlerManager.handler = (e) => errors.push(e)
    try {
      const token = timeoutToken(10)
      token.onCancel(() => {
        throw new Error("callback failed")
      })
      jest.advanceTimersByTime(10)
      expect(errors.map((e) => (e as Error).message)).toEqual(["callback failed"])
    } finally {
      safeDisposableExceptionHandlerManager.reset()
    }
  })

  it("is created by CancellationToken.timeout", () => {
    const token = CancellationToken.timeout(10)
    jest.advanceTimersByTime(10)
    expect(token.isCancelled()).toBe(true)
  })

  it("does not keep the process alive with the unref option", () => {
    jest.useRealTimers()
    const unrefSpy = jest.fn()
    const setTimeoutSpy = jest.spyOn(global, "setTimeout").mockReturnValue({
      unref: unrefSpy,
    } as unknown as NodeJS.Timeout)
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout").mockImplementation(() => {})
    try {
      const token = timeoutToken(10, { unref: true })
      expect(unrefSpy).toHaveBeenCalledTimes(1)
      token.dispose()
    } finally {
      setTimeoutSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
    }
  })
})

describe("merged token", () => {
  it("is cancelled by any of the tokens", () => {
    const a = new CancellationToken()
    const b = new CancellationToken()
    const merged = mergeTokens(a, null, b, undefined)
    const callback = jest.fn()
    merged.onCancel(callback)
    b.cancel()
    expect(merged.isCancelled()).toBe(true)
    expect(callback).toHaveBeenCalledTimes(1)
    a.cancel()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("does not cancel the tokens it follows", () => {
    const a = new CancellationToken()
    const merged = mergeTokens(a)
    merged.cancel()
    expect(merged.isCancelled()).toBe(true)
    expect(a.isCancelled()).toBe(false)
  })

  it("is created cancelled when one of the tokens is already cancelled", () => {
    const a = new CancellationToken()
    a.cancel()
    const flag: CancellationTokenLike = { isCancelled: true, cancel: jest.fn() }
    expect(mergeTokens(new CancellationToken(), a).isCancelled()).toBe(true)
    expect(CancellationToken.merge(flag).isCancelled()).toBe(true)
  })

  it("unsubscribes from the tokens when disposed, without cancelling", () => {
    const a = new CancellationToken()
    const merged = mergeTokens(a)
    const callback = jest.fn()
    merged.onCancel(callback)
    merged.dispose()
    a.cancel()
    expect(merged.isCancelled()).toBe(false)
    expect(callback).not.toHaveBeenCalled()
    expect((a as unknown as { _callbacks: unknown[] })._callbacks).toEqual([])
  })

  it("unsubscribes from the tokens at the end of a 'using' scope", () => {
    const a = new CancellationToken()
    {
      using merged = mergeTokens(a)
      expect(merged.isCancelled()).toBe(false)
      expect((a as unknown as { _callbacks: unknown[] })._callbacks.length).toBe(1)
    }
    expect((a as unknown as { _callbacks: unknown[] })._callbacks).toEqual([])
  })

  it("unsubscribes from the other tokens once cancelled", () => {
    const a = new CancellationToken()
    const b = new CancellationToken()
    mergeTokens(a, b)
    a.cancel()
    expect((b as unknown as { _callbacks: unknown[] })._callbacks).toEqual([])
  })

  it("follows a token-like object through onCancel and removeCallback", () => {
    const parent = createTokenLike()
    const merged = mergeTokens(parent)
    parent.cancel()
    expect(merged.isCancelled()).toBe(true)

    const other = createTokenLike()
    const detached = mergeTokens(other)
    detached.dispose()
    expect(other.callbacks).toEqual([])
  })

  it("ignores a token that can not unregister callbacks once disposed", () => {
    const callbacks: (() => void)[] = []
    const parent = {
      cancel: () => {
        for (const callback of callbacks) {
          callback()
        }
      },
      onCancel: (callback: () => void) => {
        callbacks.push(callback)
      },
    }
    const merged = mergeTokens(parent)
    merged.dispose()
    parent.cancel()
    expect(merged.isCancelled()).toBe(false)
  })

  it("unsubscribes from a token that cancels it from inside onCancel", () => {
    const removeCallback = jest.fn()
    const parent: CancellationTokenLike = {
      cancel: jest.fn(),
      onCancel: (callback) => callback(),
      removeCallback,
    }
    const merged = mergeTokens(parent)
    expect(merged.isCancelled()).toBe(true)
    expect(removeCallback).toHaveBeenCalledTimes(1)
  })
})

describe("onCancel function", () => {
  it("registers with any token and unregisters on dispose", () => {
    const token = createTokenLike()
    const callback = jest.fn()
    const subscription = onCancel(token, callback)
    expect(token.callbacks.length).toBe(1)
    subscription.dispose()
    expect(token.callbacks).toEqual([])
    token.cancel()
    expect(callback).not.toHaveBeenCalled()
  })

  it("stops calling the callback after dispose even when the token can not unregister it", () => {
    const callbacks: (() => void)[] = []
    const token = {
      cancel: () => {
        for (const callback of callbacks) {
          callback()
        }
      },
      onCancel: (callback: () => void) => {
        callbacks.push(callback)
      },
    }
    const callback = jest.fn()
    onCancel(token, callback).dispose()
    token.cancel()
    expect(callback).not.toHaveBeenCalled()
  })

  it("uses the subscription returned by a CancellationToken", () => {
    const token = new CancellationToken()
    const callback = jest.fn()
    const subscription = onCancel(token, callback)
    expect((token as unknown as { _callbacks: unknown[] })._callbacks.length).toBe(1)
    subscription.dispose()
    expect((token as unknown as { _callbacks: unknown[] })._callbacks).toEqual([])
    token.cancel()
    expect(callback).not.toHaveBeenCalled()
  })

  it("calls the callback when the token is cancelled", () => {
    const token = new CancellationToken()
    const callback = jest.fn()
    using _ = onCancel(token, callback)
    token.cancel()
    expect(callback).toHaveBeenCalledTimes(1)
  })
})

function createTokenLike() {
  let cancelled = false
  const callbacks: (() => void)[] = []
  return {
    callbacks,
    isCancelled: () => cancelled,
    cancel: () => {
      cancelled = true
      for (const callback of callbacks.splice(0)) {
        callback()
      }
    },
    onCancel: (callback: () => void) => {
      callbacks.push(callback)
    },
    removeCallback: (callback: () => void) => {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    },
  }
}
