import {AsyncDisposableAction, DisposableAction, DisposeFunc} from "../src"

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
    const disposable = new AsyncDisposableAction(null as unknown as () => Promise<void>)
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
})