import { DisposableStore, type IDisposable, TimeoutDisposable } from "../src"

describe("store", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it("should be disposed", () => {
    const disposable = new DisposableStore()
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("should add disposables", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    const disposable3 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
    disposable.add(disposable3)
    expect(disposable3.dispose).toHaveBeenCalled()
  })
  it("should add array of disposables", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add([disposable1, disposable2])
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("does not fail on null", () => {
    const disposable = new DisposableStore()
    disposable.add(null as IDisposable)
    disposable.dispose()
    disposable.add(undefined as IDisposable)
  })
  it("can add a func", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.add(func)
    expect(func).not.toHaveBeenCalled()
    disposable.dispose()
    expect(func).toHaveBeenCalled()
    const func2 = jest.fn()
    disposable.add(func2)
    expect(func2).toHaveBeenCalled()
  })
  it("can add multiple disposables", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1, disposable2)
    disposable.remove(disposable1)
    disposable.dispose()
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable that does not exist", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1)
    expect(disposable.remove(disposable2)).toBe(false)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
  })
  it("should not fail when removing null", () => {
    const disposable = new DisposableStore()
    disposable.remove(null as unknown as IDisposable)
    disposable.dispose()
  })
  it("should not dispose twice", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.add(disposable1)
    disposable.dispose()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
  })
  it("supports adding a single disposable", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.addOne(disposable1)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    const disposable2 = { dispose: jest.fn() }
    disposable.addOne(disposable2)
    disposable.dispose()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("supports adding a single func", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addOne(func)
    expect(func).not.toHaveBeenCalled()
    disposable.dispose()
    expect(func).toHaveBeenCalled()
    const func2 = jest.fn()
    disposable.addOne(func2)
    expect(func2).toHaveBeenCalled()
  })
  it("does not fail on a single null", () => {
    const disposable = new DisposableStore()
    disposable.addOne(null as IDisposable)
    disposable.dispose()
    disposable.addOne(undefined as IDisposable)
  })
  it("should not fail while using addOneSafe", () => {
    const disposable = new DisposableStore()
    const disposable1 = {
      dispose: () => {
        throw new Error("Test1")
      }
    }
    disposable.addOneSafe(disposable1)
    disposable.dispose()
  })
  it("should not fail while using addOneSafe with error callback", () => {
    const disposable = new DisposableStore()
    const error = new Error("TestAddOneSafe")
    const disposable1 = {
      dispose: () => {
        throw error
      }
    }
    const errorHandler = jest.fn()
    disposable.addOneSafe(disposable1, errorHandler)
    disposable.dispose()

    expect(errorHandler).toHaveBeenCalledTimes(1)
    expect(errorHandler).toHaveBeenCalledWith(error)
  })
  it("should not fail while using addOneSafe in disposed store", () => {
    const disposable = new DisposableStore()
    const error = new Error("TestAddOneSafe")
    const disposable1 = {
      dispose: () => {
        throw error
      }
    }
    const errorHandler = jest.fn()
    disposable.dispose()
    disposable.addOneSafe(disposable1, errorHandler)

    expect(errorHandler).toHaveBeenCalledTimes(1)
    expect(errorHandler).toHaveBeenCalledWith(error)
  })
  it("should not fail addOneSafe on null value", () => {
    const disposable = new DisposableStore()
    const errorHandler = jest.fn()
    disposable.addOneSafe(null, errorHandler)
    disposable.dispose()
  })
  it("should not fail addOneSafe on function value", () => {
    const disposable = new DisposableStore()
    const errorHandler = jest.fn()
    const func = jest.fn()
    disposable.addOneSafe(func, errorHandler)
    disposable.dispose()

    expect(func).toHaveBeenCalled()
    expect(errorHandler).not.toHaveBeenCalled()
  })
  it("should dispose only current disposables", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.add(disposable1)
    disposable.disposeCurrent()
    expect(disposable1.dispose).toHaveBeenCalled()
    disposable.add(disposable2)
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should not fail when disposing current on disposed store", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    disposable.add(disposable1)
    disposable.dispose()
    disposable.disposeCurrent()
    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
  })
  it("should add an timeout", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addTimeout(func, 100)
    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalled()
    disposable.dispose()
  })
  it("should add an timeout returned value", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addTimeout(setTimeout(func, 100))
    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalled()
    disposable.dispose()
  })
  it("should clear timeout on dispose", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addTimeout(func, 100)
    disposable.dispose()
    jest.advanceTimersByTime(100)
    expect(func).not.toHaveBeenCalled()
  })
  it("should add an interval", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addInterval(func, 100)
    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalled()
    disposable.dispose()
  })
  it("should add an interval returned value", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addInterval(setInterval(func, 100))
    jest.advanceTimersByTime(100)
    expect(func).toHaveBeenCalled()
    disposable.dispose()
  })
  it("should clear interval on dispose", () => {
    const disposable = new DisposableStore()
    const func = jest.fn()
    disposable.addInterval(func, 100)
    disposable.dispose()
    jest.advanceTimersByTime(100)
    expect(func).not.toHaveBeenCalled()
  })
  it("does not fail on empty array", () => {
    const disposables: IDisposable[] = []
    const disposable = new DisposableStore()
    disposable.addAll(disposables)
    disposable.add()
    disposable.dispose()
  })
  it("can use global Disposable API", () => {
    const func = jest.fn()
    {
      using _ = new DisposableStore()
      _.add(func)
      expect(func).toHaveBeenCalledTimes(0)
    }
    expect(func).toHaveBeenCalledTimes(1)
  })
  it("should create a store from an array", () => {
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    const disposables = [disposable1, disposable2]
    const disposable = DisposableStore.from(disposables)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should create a store from an array with null", () => {
    const disposable1 = { dispose: jest.fn() }
    const disposables = [disposable1, null as unknown as IDisposable]
    const disposable = DisposableStore.from(disposables)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
  })
  it("should map and create a store from an array", () => {
    const obj1 = {
      title: "Test1",
      subscriptions: new DisposableStore(),
    }
    const obj2 = {
      title: "Test2",
      subscriptions: new DisposableStore(),
    }
    const objects = [obj1, obj2]
    const disposable = DisposableStore.from(objects, (o) => o.subscriptions)
    expect(obj1.subscriptions.disposed).toBe(false)
    expect(obj2.subscriptions.disposed).toBe(false)
    disposable.dispose()
    expect(obj1.subscriptions.disposed).toBe(true)
    expect(obj1.subscriptions.disposed).toBe(true)
  })
  it("should throw if disposed", () => {
    const disposable = new DisposableStore()

    expect(() => disposable.throwIfDisposed()).not.toThrow()

    disposable.dispose()

    expect(() => disposable.throwIfDisposed("test")).toThrow("test")
  })
  it("should dispose arguments when disposed on addAll", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    disposable.dispose()
    disposable.addAll([disposable1, disposable2])
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("should dispose safely", () => {
    const disposable = new DisposableStore()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = {
      dispose: () => {
        throw new Error("Test")
      },
    }
    disposable.add(disposable1, disposable2)
    const errorCallback = jest.fn()
    disposable.disposeSafely(errorCallback)
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(errorCallback).toHaveBeenCalled()
  })
  it("should not fail disposeSafely on disposed store", () => {
    const disposable = new DisposableStore()
    disposable.dispose()
    disposable.disposeSafely()
  })
  it("should 'use' return the value", () => {
    const disposable = new DisposableStore()
    const value = {
      dispose: jest.fn(),
    }
    const result = disposable.use(() => value)
    expect(result).toBe(value)
  })
  it("should async 'use' return the value", async () => {
    const disposable = new DisposableStore()
    const value = {
      dispose: jest.fn(),
    }
    const result = await disposable.use(
      () => new Promise<IDisposable>((resolve) => resolve(value)),
    )
    expect(result).toBe(value)
  })
  it("should 'use' auto dispose the value if the store already disposed", async () => {
    const disposable = new DisposableStore()
    const value = {
      dispose: jest.fn(),
    }
    disposable.dispose()
    const result = disposable.use(() => value)
    expect(result).toBe(value)
    expect(value.dispose).toHaveBeenCalled()
  })
})

describe("store disposal semantics", () => {
  it("disposes the remaining items when one throws", () => {
    const store = new DisposableStore()
    const error = new Error("boom")
    const after = jest.fn()
    store.add(() => {
      throw error
    }, after)
    expect(() => store.dispose()).toThrow(error)
    expect(after).toHaveBeenCalledTimes(1)
    expect(() => store.dispose()).not.toThrow()
    expect(after).toHaveBeenCalledTimes(1)
  })
  it("aggregates multiple disposal errors", () => {
    const store = new DisposableStore()
    const e1 = new Error("1")
    const e2 = new Error("2")
    store.add(
      () => {
        throw e1
      },
      () => {
        throw e2
      },
    )
    let error: unknown
    try {
      store.dispose()
    } catch (e) {
      error = e
    }
    expect((error as Error).name).toBe("AggregateError")
    expect((error as { errors: unknown[] }).errors).toEqual([e1, e2])
  })
  it("disposeCurrent disposes the remaining items when one throws", () => {
    const store = new DisposableStore()
    const after = jest.fn()
    store.add(() => {
      throw new Error("boom")
    }, after)
    expect(() => store.disposeCurrent()).toThrow("boom")
    expect(after).toHaveBeenCalledTimes(1)
    store.dispose()
    expect(after).toHaveBeenCalledTimes(1)
  })
  it("adding several items to a disposed store disposes all of them", () => {
    const store = new DisposableStore()
    store.dispose()
    const after = jest.fn()
    expect(() =>
      store.add(() => {
        throw new Error("boom")
      }, after),
    ).toThrow("boom")
    expect(after).toHaveBeenCalledTimes(1)
  })
  it("does not keep fired timeouts", () => {
    jest.useFakeTimers()
    try {
      const store = new DisposableStore()
      const callback = jest.fn()
      for (let i = 0; i < 100; i++) {
        store.addTimeout(callback, 10)
      }
      jest.advanceTimersByTime(10)
      expect(callback).toHaveBeenCalledTimes(100)
      const keep = jest.fn()
      store.add(keep)
      expect((store as unknown as { _disposables: unknown[] })._disposables).toEqual([keep])
      store.dispose()
      expect(keep).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })
  it("still clears a pending timeout on dispose", () => {
    jest.useFakeTimers()
    try {
      const store = new DisposableStore()
      const callback = jest.fn()
      store.addTimeout(callback, 10)
      store.dispose()
      jest.advanceTimersByTime(10)
      expect(callback).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })
})

describe("store timeouts after dispose", () => {
  it("does not schedule a timeout on a disposed store", () => {
    jest.useFakeTimers()
    try {
      const store = new DisposableStore()
      store.dispose()
      const callback = jest.fn()
      store.addTimeout(callback, 10)
      jest.advanceTimersByTime(10)
      expect(callback).not.toHaveBeenCalled()
    } finally {
      jest.useRealTimers()
    }
  })
})

describe("store order", () => {
  it("disposes in the order of addition by default", () => {
    const store = new DisposableStore()
    const log: string[] = []
    store.add(() => log.push("a"), () => log.push("b"))
    store.addOne(() => log.push("c"))
    expect(store.order).toBe("fifo")
    store.dispose()
    expect(log).toEqual(["a", "b", "c"])
  })
  it("disposes in reverse order with lifo", () => {
    const store = new DisposableStore({ order: "lifo" })
    const log: string[] = []
    store.add(() => log.push("a"), () => log.push("b"))
    store.addOne(() => log.push("c"))
    expect(store.order).toBe("lifo")
    store.dispose()
    expect(log).toEqual(["c", "b", "a"])
  })
  it("applies lifo to disposeCurrent and keeps the store usable", () => {
    const store = new DisposableStore({ order: "lifo" })
    const log: string[] = []
    store.add(() => log.push("a"), () => log.push("b"))
    store.disposeCurrent()
    expect(log).toEqual(["b", "a"])
    expect(store.disposed).toBe(false)
    store.add(() => log.push("c"), () => log.push("d"))
    store.dispose()
    expect(log).toEqual(["b", "a", "d", "c"])
  })
  it("applies lifo to disposeSafely and still disposes past an error", () => {
    const store = new DisposableStore({ order: "lifo" })
    const log: string[] = []
    const errors: unknown[] = []
    store.add(
      () => log.push("a"),
      () => {
        throw new Error("b")
      },
      () => log.push("c"),
    )
    store.disposeSafely((e) => errors.push(e))
    expect(log).toEqual(["c", "a"])
    expect(errors.map((e) => (e as Error).message)).toEqual(["b"])
  })
  it("rethrows the errors of a lifo dispose after disposing everything", () => {
    const store = new DisposableStore({ order: "lifo" })
    const log: string[] = []
    store.add(
      () => {
        throw new Error("a")
      },
      () => log.push("b"),
      () => {
        throw new Error("c")
      },
    )
    let thrown: unknown
    try {
      store.dispose()
    } catch (e) {
      thrown = e
    }
    expect(log).toEqual(["b"])
    expect((thrown as { errors: Error[] }).errors.map((e) => e.message)).toEqual(["c", "a"])
  })
  it("disposes in reverse order at the end of a 'using' scope", () => {
    const log: string[] = []
    {
      using store = new DisposableStore({ order: "lifo" })
      store.add(() => log.push("a"), () => log.push("b"))
    }
    expect(log).toEqual(["b", "a"])
  })
})

describe("store disposeCurrentSafely", () => {
  it("passes errors to the callback and keeps the store usable", () => {
    const store = new DisposableStore()
    const after = jest.fn()
    const errors: unknown[] = []
    store.add(() => {
      throw new Error("first")
    }, after)
    store.disposeCurrentSafely((e) => errors.push(e))
    expect(after).toHaveBeenCalledTimes(1)
    expect(errors.map((e) => (e as Error).message)).toEqual(["first"])
    expect(store.disposed).toBe(false)
    const next = jest.fn()
    store.add(next)
    store.dispose()
    expect(next).toHaveBeenCalledTimes(1)
    expect(after).toHaveBeenCalledTimes(1)
  })
  it("does not throw without a callback", () => {
    const store = new DisposableStore()
    store.add(() => {
      throw new Error("ignored")
    })
    expect(() => store.disposeCurrentSafely()).not.toThrow()
  })
  it("keeps an item added during the disposal for the next round", () => {
    const store = new DisposableStore()
    const late = jest.fn()
    store.add(() => store.add(late))
    store.disposeCurrentSafely()
    expect(late).not.toHaveBeenCalled()
    store.dispose()
    expect(late).toHaveBeenCalledTimes(1)
  })
  it("does nothing on a disposed store", () => {
    const store = new DisposableStore()
    store.dispose()
    expect(() => store.disposeCurrentSafely()).not.toThrow()
  })
})

describe("store timers", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it("returns the timeout, which can be cleared on its own", () => {
    const store = new DisposableStore()
    const callback = jest.fn()
    const timeout = store.addTimeout(callback, 10)
    expect(timeout).toBeInstanceOf(TimeoutDisposable)
    timeout.dispose()
    jest.advanceTimersByTime(10)
    expect(callback).not.toHaveBeenCalled()
    expect((store as unknown as { _disposables: unknown[] })._disposables).toEqual([])
  })
  it("returns the interval, which can be cleared on its own", () => {
    const store = new DisposableStore()
    const callback = jest.fn()
    const interval = store.addInterval(callback, 10)
    jest.advanceTimersByTime(20)
    interval.dispose()
    jest.advanceTimersByTime(20)
    expect(callback).toHaveBeenCalledTimes(2)
    expect((store as unknown as { _disposables: unknown[] })._disposables).toEqual([])
  })
  it("clears the returned timers when the store is disposed", () => {
    const store = new DisposableStore()
    const timeout = store.addTimeout(jest.fn(), 10)
    const interval = store.addInterval(jest.fn(), 10)
    store.dispose()
    expect(timeout.disposed).toBe(true)
    expect(interval.disposed).toBe(true)
  })
  it("returns disposed timers from a disposed store", () => {
    const store = new DisposableStore()
    store.dispose()
    const callback = jest.fn()
    const timeout = store.addTimeout(callback, 10)
    const interval = store.addInterval(callback, 10)
    jest.advanceTimersByTime(20)
    expect(callback).not.toHaveBeenCalled()
    expect(timeout.disposed).toBe(true)
    expect(interval.disposed).toBe(true)
  })
  it("passes the unref option to the timers", () => {
    jest.useRealTimers()
    const store = new DisposableStore()
    const timeout = store.addTimeout(jest.fn(), 10_000, { unref: true })
    const interval = store.addInterval(jest.fn(), 10_000, { unref: true })
    expect((timeout as unknown as { _handle: NodeJS.Timeout })._handle.hasRef()).toBe(false)
    expect((interval as unknown as { _handle: NodeJS.Timeout })._handle.hasRef()).toBe(false)
    store.dispose()
  })
})
