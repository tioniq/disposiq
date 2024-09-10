import {
  createDisposable,
  createDisposableCompat,
  DisposableAction, DisposableLike,
  emptyDisposable,
  IAsyncDisposable
} from "../src";

describe('create', () => {
  it("should return disposable as is", () => {
    const disposable = new DisposableAction(() => {
    })
    expect(createDisposable(disposable)).toBe(disposable)
  })
  it("should return empty disposable if undefined", () => {
    expect(createDisposable(undefined as unknown as DisposableLike)).toBe(emptyDisposable)
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
      unref: func
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
      [Symbol.dispose]: func
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("support global AsyncDisposable API", async () => {
    const func = jest.fn()
    const disposable = createDisposable({
      [Symbol.asyncDispose]: func
    }) as IAsyncDisposable
    expect(func).toHaveBeenCalledTimes(0)
    await disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
});
describe('create compat', () => {
  it("should return disposable as is", () => {
    const disposable = new DisposableAction(() => {
    })
    expect(createDisposableCompat(disposable)).toBe(disposable)
  })
  it("should return empty disposable if undefined", () => {
    expect(createDisposableCompat(undefined as unknown as DisposableLike)).toBe(emptyDisposable)
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
      unref: func
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
      [Symbol.dispose]: func
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("can handle only dispose", () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      dispose: func
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("convert async dispose to sync", async () => {
    const func = jest.fn()
    const disposable = createDisposableCompat({
      [Symbol.asyncDispose]: func
    })
    expect(func).toHaveBeenCalledTimes(0)
    disposable.dispose()
    expect(func).toHaveBeenCalledTimes(1)
  })
})