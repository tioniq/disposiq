import { CancellationTokenDisposable, type CancellationTokenLike, disposableFromCancellationToken } from "../src";

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