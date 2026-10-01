import { AsyncDisposableStore, type IDisposable, TimeoutDisposable } from "../src"

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

describe("async store disposal semantics", () => {
  function deferred() {
    let resolve: () => void
    const promise = new Promise<void>((r) => {
      resolve = r
    })
    return { promise, resolve }
  }

  it("disposeSafely marks the store disposed synchronously", async () => {
    const store = new AsyncDisposableStore()
    const promise = store.disposeSafely()
    expect(store.disposed).toBe(true)
    await promise
    const late = jest.fn()
    await store.add(late)
    expect(late).toHaveBeenCalledTimes(1)
  })
  it("disposeSafely does not dispose items twice", async () => {
    const store = new AsyncDisposableStore()
    const item = jest.fn()
    store.add(item)
    await store.disposeSafely()
    await store.disposeSafely()
    await store.dispose()
    expect(item).toHaveBeenCalledTimes(1)
  })
  it("disposeSafely always returns a promise", async () => {
    const store = new AsyncDisposableStore()
    await store.dispose()
    expect(store.disposeSafely()).toBeInstanceOf(Promise)
  })
  it("concurrent dispose calls wait for the same disposal", async () => {
    const store = new AsyncDisposableStore()
    const gate = deferred()
    const done = jest.fn()
    store.add(async () => {
      await gate.promise
      done()
    })
    const first = store.dispose()
    const second = store.dispose()
    const safe = store.disposeSafely()
    let settled = false
    second.then(() => {
      settled = true
    })
    await Promise.resolve()
    await Promise.resolve()
    expect(settled).toBe(false)
    gate.resolve()
    await Promise.all([first, second, safe])
    expect(done).toHaveBeenCalledTimes(1)
  })
  it("disposes the remaining items when one rejects", async () => {
    const store = new AsyncDisposableStore()
    const error = new Error("boom")
    const after = jest.fn()
    store.add(
      async () => {
        throw error
      },
      after,
    )
    await expect(store.dispose()).rejects.toBe(error)
    expect(after).toHaveBeenCalledTimes(1)
    await expect(store.dispose()).resolves.toBeUndefined()
  })
  it("aggregates multiple disposal errors", async () => {
    const store = new AsyncDisposableStore()
    const e1 = new Error("1")
    const e2 = new Error("2")
    store.add(
      () => {
        throw e1
      },
      async () => {
        throw e2
      },
    )
    const error = await store.dispose().then(
      (): unknown => undefined,
      (e: unknown) => e,
    )
    expect((error as Error).name).toBe("AggregateError")
    expect((error as { errors: unknown[] }).errors).toEqual([e1, e2])
  })
  it("disposeCurrent disposes the remaining items when one throws", async () => {
    const store = new AsyncDisposableStore()
    const after = jest.fn()
    store.add(() => {
      throw new Error("boom")
    }, after)
    await expect(store.disposeCurrent()).rejects.toThrow("boom")
    expect(after).toHaveBeenCalledTimes(1)
    expect(store.disposed).toBe(false)
  })
})

describe("async store disposeSafely and dispose together", () => {
  it("dispose during disposeSafely does not dispose items twice", async () => {
    const store = new AsyncDisposableStore()
    const item = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
    })
    store.add(item)
    const safe = store.disposeSafely()
    const plain = store.dispose()
    await Promise.all([safe, plain])
    expect(item).toHaveBeenCalledTimes(1)
  })
})

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function step(log: string[], name: string, ms = 0) {
  return async () => {
    log.push(`start ${name}`)
    if (ms > 0) {
      await delay(ms)
    }
    log.push(`end ${name}`)
  }
}

describe("async store order", () => {
  it("disposes in the order of addition by default, each awaited", async () => {
    const store = new AsyncDisposableStore()
    const log: string[] = []
    store.add(step(log, "a", 5), step(log, "b"))
    expect(store.order).toBe("fifo")
    expect(store.serial).toBe(false)
    await store.dispose()
    expect(log).toEqual(["start a", "end a", "start b", "end b"])
  })
  it("disposes in reverse order with lifo, each awaited", async () => {
    const store = new AsyncDisposableStore({ order: "lifo" })
    const log: string[] = []
    store.addOne(step(log, "port"))
    store.addOne(step(log, "forward", 5))
    store.addOne({ dispose: () => log.push("client") })
    await store.dispose()
    expect(log).toEqual(["client", "start forward", "end forward", "start port", "end port"])
  })
  it("applies lifo to disposeCurrent and disposeSafely", async () => {
    const store = new AsyncDisposableStore({ order: "lifo" })
    const log: string[] = []
    store.add(() => log.push("1"), () => log.push("2"))
    await store.disposeCurrent()
    expect(store.disposed).toBe(false)
    store.add(() => log.push("3"), () => log.push("4"))
    await store.disposeSafely()
    expect(log).toEqual(["2", "1", "4", "3"])
  })
  it("disposes in reverse order at the end of an 'await using' scope", async () => {
    const log: string[] = []
    {
      await using store = new AsyncDisposableStore({ order: "lifo" })
      store.add(step(log, "a"), step(log, "b"))
    }
    expect(log).toEqual(["start b", "end b", "start a", "end a"])
  })
})

describe("async store disposeCurrentSafely", () => {
  it("passes errors to the callback, never rejects and keeps the store usable", async () => {
    const store = new AsyncDisposableStore()
    const errors: unknown[] = []
    const after = jest.fn()
    store.add(async () => {
      throw new Error("round 1")
    }, after)
    await expect(store.disposeCurrentSafely((e) => errors.push(e))).resolves.toBeUndefined()
    expect(after).toHaveBeenCalledTimes(1)
    expect(store.disposed).toBe(false)
    store.add(() => {
      throw new Error("round 2")
    })
    await store.disposeSafely((e) => errors.push(e))
    expect(errors.map((e) => (e as Error).message)).toEqual(["round 1", "round 2"])
  })
  it("keeps an item added during the disposal for the next round", async () => {
    const store = new AsyncDisposableStore()
    const late = jest.fn()
    store.add(async () => {
      store.add(late)
    })
    await store.disposeCurrentSafely()
    expect(late).not.toHaveBeenCalled()
    await store.dispose()
    expect(late).toHaveBeenCalledTimes(1)
  })
  it("resolves on a disposed store", async () => {
    const store = new AsyncDisposableStore()
    await store.dispose()
    await expect(store.disposeCurrentSafely()).resolves.toBeUndefined()
  })
})

describe("async store without serial", () => {
  it("does not make a second disposeCurrent wait for the first", async () => {
    const store = new AsyncDisposableStore()
    const log: string[] = []
    store.add(step(log, "slow", 20))
    const first = store.disposeCurrent()
    await store.disposeCurrent()
    log.push("second resolved")
    await first
    expect(log).toEqual(["start slow", "second resolved", "end slow"])
  })
})

describe("async store serial", () => {
  it("resolves a second disposeCurrent only after the first round has finished", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const log: string[] = []
    store.add(step(log, "session 1", 20))
    const first = store.disposeCurrent().then(() => log.push("first resolved"))
    store.add(step(log, "session 2"))
    const second = store.disposeCurrent().then(() => log.push("second resolved"))
    await Promise.all([first, second])
    expect(log).toEqual([
      "start session 1",
      "end session 1",
      "first resolved",
      "start session 2",
      "end session 2",
      "second resolved",
    ])
  })
  it("makes an empty disposeCurrent wait for the round in progress", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const log: string[] = []
    store.add(step(log, "teardown", 20))
    void store.disposeCurrent()
    await store.disposeCurrent()
    expect(log).toEqual(["start teardown", "end teardown"])
  })
  it("makes dispose wait for a disposeCurrent in progress before disposing the rest", async () => {
    const store = new AsyncDisposableStore({ serial: true, order: "lifo" })
    const log: string[] = []
    store.add(step(log, "session", 20))
    void store.disposeCurrent()
    store.add(step(log, "device"), step(log, "slot"))
    await store.dispose()
    expect(log).toEqual(["start session", "end session", "start slot", "end slot", "start device", "end device"])
  })
  it("makes disposeSafely wait for a disposeCurrent in progress", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const log: string[] = []
    store.add(step(log, "session", 20))
    void store.disposeCurrent()
    store.add(step(log, "device"))
    await store.disposeSafely()
    expect(log).toEqual(["start session", "end session", "start device", "end device"])
  })
  it("rejects a round with its own errors only, and the next round still runs", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const after = jest.fn()
    store.add(() => {
      throw new Error("round 1")
    })
    const first = store.disposeCurrent()
    store.add(after)
    const second = store.disposeCurrent()
    await expect(first).rejects.toThrow("round 1")
    await expect(second).resolves.toBeUndefined()
    expect(after).toHaveBeenCalledTimes(1)
  })
  it("runs a safe round after a failed one", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const errors: unknown[] = []
    store.add(() => {
      throw new Error("a")
    })
    const first = store.disposeCurrent().then((): undefined => undefined, (e: Error) => e.message)
    store.add(() => {
      throw new Error("b")
    })
    await store.disposeCurrentSafely((e) => errors.push(e))
    await expect(first).resolves.toBe("a")
    expect(errors.map((e) => (e as Error).message)).toEqual(["b"])
  })
  it("shares one disposal between concurrent dispose calls, and disposeCurrent afterwards waits for it", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const log: string[] = []
    store.add(step(log, "only", 10))
    const a = store.dispose()
    const b = store.dispose()
    expect(a).toBe(b)
    await store.disposeCurrent()
    expect(log).toEqual(["start only", "end only"])
    await a
  })
  it("settles disposeCurrent on a disposed store without rejecting when the disposal fails", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    store.add(async () => {
      await delay(5)
      throw new Error("failed")
    })
    const disposing = store.dispose().then((): undefined => undefined, (e: Error) => e.message)
    await expect(store.disposeCurrent()).resolves.toBeUndefined()
    await expect(store.disposeCurrentSafely()).resolves.toBeUndefined()
    await expect(disposing).resolves.toBe("failed")
  })
  it("disposes an item added during the disposal at once", async () => {
    const store = new AsyncDisposableStore({ serial: true })
    const log: string[] = []
    store.add(async () => {
      await store.addOne(step(log, "late", 5))
      log.push("first")
    })
    await store.dispose()
    expect(log).toEqual(["start late", "end late", "first"])
  })
})

describe("async store timers", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })
  it("leaves the store once a timeout has fired, and clears a pending one on dispose", async () => {
    const store = new AsyncDisposableStore()
    const fired = jest.fn()
    store.addTimeout(fired, 1)
    const pending = store.addTimeout(fired, 10_000)
    expect(pending).toBeInstanceOf(TimeoutDisposable)
    jest.advanceTimersByTime(1)
    expect(fired).toHaveBeenCalledTimes(1)
    expect((store as unknown as { _disposables: unknown[] })._disposables).toEqual([pending])
    await store.dispose()
    expect(pending.disposed).toBe(true)
    jest.advanceTimersByTime(10_000)
    expect(fired).toHaveBeenCalledTimes(1)
  })
  it("runs an interval until the store is disposed", async () => {
    const store = new AsyncDisposableStore()
    const callback = jest.fn()
    const interval = store.addInterval(callback, 10)
    jest.advanceTimersByTime(30)
    await store.dispose()
    jest.advanceTimersByTime(30)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(interval.disposed).toBe(true)
  })
  it("removes a timer disposed on its own from the store", () => {
    const store = new AsyncDisposableStore()
    store.addTimeout(jest.fn(), 10).dispose()
    store.addInterval(jest.fn(), 10).dispose()
    expect((store as unknown as { _disposables: unknown[] })._disposables).toEqual([])
  })
  it("returns disposed timers from a disposed store", async () => {
    const store = new AsyncDisposableStore()
    await store.dispose()
    const callback = jest.fn()
    expect(store.addTimeout(callback, 1).disposed).toBe(true)
    expect(store.addInterval(callback, 1).disposed).toBe(true)
    jest.advanceTimersByTime(5)
    expect(callback).not.toHaveBeenCalled()
  })
})
