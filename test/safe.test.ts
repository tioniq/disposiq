import {
  SafeActionDisposable,
  SafeAsyncActionDisposable,
  safeDisposableExceptionHandlerManager,
} from "../src"

describe("safe", () => {
  beforeEach(() => {
    safeDisposableExceptionHandlerManager.handler = () => {}
  })
  afterEach(() => {
    safeDisposableExceptionHandlerManager.reset()
  })
  it("should not thrown on empty func", () => {
    const disposable = new SafeActionDisposable(() => {})
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("should not throw", () => {
    const disposable = new SafeActionDisposable(() => {
      throw new Error("error")
    })
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("async", async () => {
    const disposable = new SafeAsyncActionDisposable(async () => {
      throw new Error("error")
    })
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("empty async", async () => {
    const disposable = new SafeAsyncActionDisposable(
      null as unknown as () => Promise<void>,
    )
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("second call does nothing", () => {
    const disposable = new SafeActionDisposable(() => {})
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("second async call does nothing", async () => {
    const disposable = new SafeAsyncActionDisposable(async () => {})
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("can use global Disposable API", () => {
    let disposable: SafeActionDisposable
    {
      using _ = new SafeActionDisposable(() => {})
      disposable = _
      expect(_.disposed).toBe(false)
    }
    expect(disposable.disposed).toBe(true)
  })
  it("can use global AsyncDisposable API", async () => {
    let disposable: SafeAsyncActionDisposable
    {
      await using _ = new SafeAsyncActionDisposable(async () => {})
      disposable = _
      expect(_.disposed).toBe(false)
    }
    expect(disposable.disposed).toBe(true)
  })
})

describe("safe async action disposal semantics", () => {
  it("concurrent dispose calls wait for the same disposal", async () => {
    let release: () => void
    const gate = new Promise<void>((r) => {
      release = r
    })
    const done = jest.fn()
    const action = new SafeAsyncActionDisposable(async () => {
      await gate
      done()
    })
    const first = action.dispose()
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
})
