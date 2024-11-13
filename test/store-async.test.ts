import { AsyncDisposableStore, type IDisposable } from "../src"

describe("async store", () => {
  it("should be disposed", async () => {
    const disposable = new AsyncDisposableStore()
    expect(disposable.disposed).toBe(false)
    await disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("should add disposables", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    const disposable3 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
    disposable.add(disposable3)
    expect(disposable3.dispose).toHaveBeenCalled()
  })
  it("should add array of disposables", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add([disposable1, disposable2])
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("does not fail on null", async () => {
    const disposable = new AsyncDisposableStore()
    disposable.add(null as IDisposable)
    await disposable.dispose()
    disposable.add(undefined as IDisposable)
  })
  it("can add a func", async () => {
    const disposable = new AsyncDisposableStore()
    const func = jest.fn()
    disposable.add(func)
    expect(func).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(func).toHaveBeenCalled()
    const func2 = jest.fn()
    disposable.add(func2)
    expect(func2).toHaveBeenCalled()
  })
  it("can add multiple disposables", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    disposable.remove(disposable1)
    await disposable.dispose()
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable that does not exist", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1)
    expect(disposable.remove(disposable2)).toBe(false)
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
  })
  it("should not fail when removing null", async () => {
    const disposable = new AsyncDisposableStore()
    disposable.remove(null as unknown as IDisposable)
    await disposable.dispose()
  })
  it("should not dispose twice", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.add(disposable1)
    await disposable.dispose()
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
  })
  it("supports adding a single disposable", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.addOne(disposable1)
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    const disposable2 = { dispose: jest.fn() }
    disposable.addOne(disposable2)
    await disposable.dispose()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("supports adding a single func", async () => {
    const disposable = new AsyncDisposableStore()
    const func = jest.fn()
    await disposable.addOne(func)
    expect(func).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(func).toHaveBeenCalled()
    const func2 = jest.fn()
    await disposable.addOne(func2)
    expect(func2).toHaveBeenCalled()
  })
  it("does not fail on a single null", async () => {
    const disposable = new AsyncDisposableStore()
    await disposable.addOne(null as IDisposable)
    await disposable.dispose()
    await disposable.addOne(undefined as IDisposable)
  })
  it("should dispose only current disposables", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1)
    await disposable.disposeCurrent()
    expect(disposable1.dispose).toHaveBeenCalled()
    disposable.add(disposable2)
    expect(disposable2.dispose).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should not fail when disposing current on disposed store", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.add(disposable1)
    await disposable.dispose()
    await disposable.disposeCurrent()
    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
  })
  it("does not fail on empty array", async () => {
    const disposables: IDisposable[] = []
    const disposable = new AsyncDisposableStore()
    await disposable.addAll(disposables)
    await disposable.add()
    await disposable.dispose()
  })
  it("can use global Disposable API", () => {
    const func = jest.fn()
    {
      using _ = new AsyncDisposableStore()
      _.add(func)
      expect(func).toHaveBeenCalledTimes(0)
    }
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should create a store from an array", async () => {
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    const disposables = [disposable1, disposable2]
    const disposable = AsyncDisposableStore.from(disposables)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should create a store from an array with null", async () => {
    const disposable1 = { dispose: jest.fn() }
    const disposables = [disposable1, null as unknown as IDisposable]
    const disposable = AsyncDisposableStore.from(disposables)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    await disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
  })
  it("should map and create a store from an array", async () => {
    const obj1 = {
      title: "Test1",
      subscriptions: new AsyncDisposableStore(),
    }
    const obj2 = {
      title: "Test2",
      subscriptions: new AsyncDisposableStore(),
    }
    const objects = [obj1, obj2]
    const disposable = AsyncDisposableStore.from(
      objects,
      (o) => o.subscriptions,
    )
    expect(obj1.subscriptions.disposed).toBe(false)
    expect(obj2.subscriptions.disposed).toBe(false)
    await disposable.dispose()
    expect(obj1.subscriptions.disposed).toBe(true)
    expect(obj1.subscriptions.disposed).toBe(true)
  })
  it("should throw if disposed", async () => {
    const disposable = new AsyncDisposableStore()

    expect(() => disposable.throwIfDisposed()).not.toThrow()

    await disposable.dispose()

    expect(() => disposable.throwIfDisposed("test")).toThrow("test")
  })
  it("should dispose arguments when disposed on addAll", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    await disposable.dispose()
    await disposable.addAll([disposable1, disposable2])
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should dispose safely", async () => {
    const disposable = new AsyncDisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = {
      dispose: () => {
        throw new Error("Test")
      },
    }
    await disposable.add(disposable1, disposable2)
    const errorCallback = jest.fn()
    await disposable.disposeSafely(errorCallback)
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(errorCallback).toHaveBeenCalled()
  })
  it("should not fail disposeSafely on disposed store", async () => {
    const disposable = new AsyncDisposableStore()
    await disposable.dispose()
    await disposable.disposeSafely()
  })
})
