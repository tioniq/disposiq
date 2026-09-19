import "expose-gc"
import {
  AsyncDisposableAction,
  DisposableAction,
  type DisposeFunc,
} from "../src"

describe("action", () => {
  it("should be called only once", () => {
    const func = jest.fn()
    const disposable = new DisposableAction(func)
    expect(func).toHaveBeenCalledTimes(0)
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    expect(disposable.disposed).toBe(true)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    expect(disposable.disposed).toBe(true)
  })
  it("can use global Disposable API", () => {
    const func = jest.fn()
    {
      using disposable = new DisposableAction(func)
      expect(func).toHaveBeenCalledTimes(0)
    }
    expect(func).toHaveBeenCalledTimes(1)
  })

  it("async should be called only once", async () => {
    const func = jest.fn()
    const disposable = new AsyncDisposableAction(func)
    expect(func).toHaveBeenCalledTimes(0)
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    expect(disposable.disposed).toBe(true)
    await disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    expect(disposable.disposed).toBe(true)
  })
  it("should not fail if action is not a function", () => {
    const disposable = new DisposableAction(null as unknown as DisposeFunc)
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("can use global AsyncDisposable API", async () => {
    const func = jest.fn()
    {
      await using _ = new AsyncDisposableAction(func)
      expect(func).toHaveBeenCalledTimes(0)
    }
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("AsyncDisposable should not fail if action is not a function", async () => {
    const disposable = new AsyncDisposableAction(
      null as unknown as () => Promise<void>,
    )
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
})

describe("action disposal semantics", () => {
  it("async: concurrent dispose calls wait for the same disposal", async () => {
    let release: () => void
    const gate = new Promise<void>((r) => {
      release = r
    })
    const done = jest.fn()
    const action = new AsyncDisposableAction(async () => {
      await gate
      done()
    })
    const first = action.dispose()
    expect(action.disposed).toBe(true)
    let secondSettled = false
    const second = action.dispose().then(() => {
      secondSettled = true
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(secondSettled).toBe(false)
    release()
    await Promise.all([first, second])
    expect(done).toHaveBeenCalledTimes(1)
  })
  it("async: a failed disposal rejects concurrent callers and later calls are a no-op", async () => {
    const error = new Error("boom")
    let release: () => void
    const gate = new Promise<void>((r) => {
      release = r
    })
    const action = new AsyncDisposableAction(async () => {
      await gate
      throw error
    })
    const first = action.dispose()
    const second = action.dispose()
    release()
    await expect(first).rejects.toBe(error)
    await expect(second).rejects.toBe(error)
    await expect(action.dispose()).resolves.toBeUndefined()
  })
  it("async: a synchronously throwing action rejects instead of throwing", async () => {
    const error = new Error("sync")
    const action = new AsyncDisposableAction(() => {
      throw error
    })
    const promise = action.dispose()
    expect(action.disposed).toBe(true)
    await expect(promise).rejects.toBe(error)
  })

  async function collectedAfterDispose(
    create: (captured: object) => { dispose(): unknown },
  ): Promise<boolean> {
    let captured: object | undefined = { payload: new Array(1000).fill(0) }
    const ref = new WeakRef(captured)
    const disposable = create(captured)
    captured = undefined
    await disposable.dispose()
    await new Promise((resolve) => setTimeout(resolve, 0))
    global.gc()
    const collected = ref.deref() === undefined
    // keep the disposable alive until after the GC
    expect(disposable).toBeDefined()
    return collected
  }

  it("releases the action closure after dispose", async () => {
    expect(
      await collectedAfterDispose((c) => new DisposableAction(() => void c)),
    ).toBe(true)
  })
  it("async: releases the action closure after dispose", async () => {
    expect(
      await collectedAfterDispose(
        (c) => new AsyncDisposableAction(async () => void c),
      ),
    ).toBe(true)
  })
})
