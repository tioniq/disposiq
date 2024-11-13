import {
  type AsyncDisposiq,
  createDisposable,
  createDisposableCompat,
  createDisposiq,
  DisposableAction,
  type DisposableLike,
  Disposiq,
  emptyDisposable,
  type IAsyncDisposable,
  type IDisposable,
} from "../src"

describe("create", () => {
  it("should return disposable as is", () => {
    const disposable = new DisposableAction(() => {})
    expect(createDisposable(disposable)).toBe(disposable)
  })
  it("should return empty disposable if undefined", () => {
    expect(createDisposable(undefined as unknown as DisposableLike)).toBe(
      emptyDisposable,
    )
  })
  it("should wrap function to disposable", () => {
    const func = jest.fn()
    const disposable = createDisposable(func)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should wrap AbortController to disposable", () => {
    const controller = new AbortController()
    const disposable = createDisposable(controller)
    expect(controller.signal.aborted).toBe(false)
    disposable.dispose()
    expect(controller.signal.aborted).toBe(true)
  })
  it("should call unref", () => {
    const func = jest.fn()
    const disposable = createDisposable({
      // @ts-ignore
      unref: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should not fail if invalid", () => {
    const disposable = createDisposable(123 as unknown as DisposableLike)
    disposable.dispose()
  })
  it("support global Disposable API", () => {
    const func = jest.fn()
    const disposable = createDisposable({
      [Symbol.dispose]: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("support global AsyncDisposable API", async () => {
    const func = jest.fn()
    const disposable = createDisposable({
      [Symbol.asyncDispose]: func,
    }) as IAsyncDisposable
    expect(func).toHaveBeenCalledTimes(0)
    await disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should return empty disposable on bad object", () => {
    const disposable = createDisposable({} as IDisposable)
    disposable.dispose()
  })
})
describe("create compat", () => {
  it("should return disposable as is", () => {
    const disposable = new DisposableAction(() => {})
    expect(createDisposableCompat(disposable)).toBe(disposable)
  })
  it("should return empty disposable if undefined", () => {
    expect(createDisposableCompat(undefined as unknown as DisposableLike)).toBe(
      emptyDisposable,
    )
  })
  it("should wrap function to disposable", () => {
    const func = jest.fn()
    const disposable = createDisposableCompat(func)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should wrap AbortController to disposable", () => {
    const controller = new AbortController()
    const disposable = createDisposableCompat(controller)
    expect(controller.signal.aborted).toBe(false)
    disposable.dispose()
    expect(controller.signal.aborted).toBe(true)
  })
  it("should call unref", () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      // @ts-ignore
      unref: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should not fail if invalid", () => {
    const disposable = createDisposableCompat(123 as unknown as DisposableLike)
    disposable.dispose()
  })
  it("support global Disposable API", () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      [Symbol.dispose]: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("can handle only dispose", () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      dispose: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("convert async dispose to sync", async () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      [Symbol.asyncDispose]: func,
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should return empty disposable on bad object", () => {
    const disposable = createDisposableCompat({} as IDisposable)
    disposable.dispose()
  })
})

describe("create disposiq", () => {
  it("should return disposable as is", () => {
    const disposable = new DisposableAction(() => {})
    expect(createDisposiq(disposable)).toBe(disposable)
  })
  it("should return empty disposable if undefined", () => {
    expect(createDisposiq(undefined as unknown as DisposableLike)).toBe(
      emptyDisposable,
    )
  })
  it("should wrap function to disposable", () => {
    const func = jest.fn()
    const disposable = createDisposiq(func)
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should wrap AbortController to disposable", () => {
    const controller = new AbortController()
    const disposable = createDisposiq(controller)
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(controller.signal.aborted).toBe(false)
    disposable.dispose()
    expect(controller.signal.aborted).toBe(true)
  })
  it("should call unref", () => {
    const func = jest.fn()
    const disposable = createDisposiq({
      // @ts-ignore
      unref: func,
    })
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should not fail if invalid", () => {
    const disposable = createDisposiq(123 as unknown as DisposableLike)
    expect(disposable).toBeInstanceOf(Disposiq)
    disposable.dispose()
  })
  it("support global Disposable API", () => {
    const func = jest.fn()
    const disposable = createDisposiq({
      [Symbol.dispose]: func,
    })
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("support global AsyncDisposable API", async () => {
    const func = jest.fn()
    const disposable = createDisposiq({
      [Symbol.asyncDispose]: func,
    }) as AsyncDisposiq
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    await disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("support custom disposiq-like object", () => {
    const func = jest.fn()
    const symbolFunc = jest.fn()
    const disposable = createDisposiq({
      dispose: func,
      [Symbol.dispose]: symbolFunc,
    })
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    expect(symbolFunc).toHaveBeenCalledTimes(0)
    disposable.dispose()
    disposable[Symbol.dispose]()
    expect(func).toHaveBeenCalledTimes(1)
    expect(symbolFunc).toHaveBeenCalledTimes(1)
  })
  it("should wrap dispose function", () => {
    const func = jest.fn()
    const disposable = createDisposiq({
      dispose: func,
    })
    expect(disposable).toBeInstanceOf(Disposiq)
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should return empty disposable on bad object", () => {
    const disposable = createDisposiq({} as IDisposable)
    expect(disposable).toBe(emptyDisposable)
  })
})
