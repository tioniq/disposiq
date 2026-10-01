import {
  AsyncDisposable,
  AsyncDisposableAction,
  type AsyncDisposableOptions,
  DisposableAction,
  type IAsyncDisposable,
  type IDisposable,
  ObjectDisposedException,
  safeDisposableExceptionHandlerManager,
  type TimerOptions,
} from "../src"

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

class Service extends AsyncDisposable {
  readonly log: string[] = []

  // biome-ignore lint/complexity/noUselessConstructor: the constructor is necessary
  constructor(options?: AsyncDisposableOptions) {
    super(options)
  }

  open(name: string, ms = 0): AsyncDisposableAction {
    return this.register(
      new AsyncDisposableAction(async () => {
        this.log.push(`close ${name}`)
        await delay(ms)
      }),
    )
  }

  override register<T extends IDisposable | IAsyncDisposable>(t: T): T {
    return super.register(t)
  }

  override registerAsync<T extends IDisposable | IAsyncDisposable>(
    promiseOrAction: Promise<T> | (() => Promise<T>) | (() => T) | T,
  ): Promise<T> {
    return super.registerAsync(promiseOrAction)
  }

  override throwIfDisposed(message?: string): void {
    super.throwIfDisposed(message)
  }

  override addTimeout(callback: () => void, timeout: number, options?: TimerOptions) {
    return super.addTimeout(callback, timeout, options)
  }

  override addInterval(callback: () => void, interval: number, options?: TimerOptions) {
    return super.addInterval(callback, interval, options)
  }
}

describe("async disposable", () => {
  it("disposes what was registered in the order of registration by default, each awaited", async () => {
    const service = new Service()
    service.open("a", 5)
    service.open("b")
    service.addDisposable(() => {
      service.log.push("c")
    })
    await service.dispose()
    expect(service.log).toEqual(["close a", "close b", "c"])
  })

  it("disposes in reverse order with lifo", async () => {
    const service = new Service({ order: "lifo" })
    service.open("port", 5)
    service.open("forward", 5)
    service.addDisposable(async () => {
      await delay(5)
      service.log.push("client exit")
    })
    await service.dispose()
    expect(service.log).toEqual(["client exit", "close forward", "close port"])
  })

  it("is disposed from the first call, and concurrent calls share the disposal", async () => {
    const service = new Service()
    service.open("slow", 20)
    expect(service.disposed).toBe(false)
    const first = service.dispose()
    expect(service.disposed).toBe(true)
    expect(() => service.throwIfDisposed("Service")).toThrow(ObjectDisposedException)
    expect(() => service.throwIfDisposed("Service")).toThrow("Service")
    const second = service.dispose()
    expect(second).toBe(first)
    await second
    await service.dispose()
    expect(service.log).toEqual(["close slow"])
  })

  it("disposes everything past an error and rejects with it", async () => {
    const service = new Service()
    service.addDisposables(
      () => {
        throw new Error("a")
      },
      () => {
        service.log.push("b")
      },
    )
    await expect(service.dispose()).rejects.toThrow("a")
    expect(service.log).toEqual(["b"])
  })

  it("rejects with an AggregateError when several fail", async () => {
    const service = new Service()
    service.addDisposables(
      () => {
        throw new Error("a")
      },
      async () => {
        throw new Error("b")
      },
    )
    const error = await service.dispose().then(
      (): undefined => undefined,
      (e: unknown) => e,
    )
    expect((error as { errors: Error[] }).errors.map((e) => e.message)).toEqual(["a", "b"])
  })

  it("passes errors to onError and resolves", async () => {
    const errors: unknown[] = []
    const service = new Service({ onError: (e) => errors.push(e) })
    service.addDisposable(() => {
      throw new Error("c")
    })
    service.open("d")
    await expect(service.dispose()).resolves.toBeUndefined()
    expect(errors.map((e) => (e as Error).message)).toEqual(["c"])
    expect(service.log).toEqual(["close d"])
  })

  it("registers a disposable and returns it", async () => {
    const service = new Service()
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    expect(service.register(disposable)).toBe(disposable)
    await service.dispose()
    expect(action).toHaveBeenCalledTimes(1)
  })

  it("registers a disposable from a promise or a function", async () => {
    const service = new Service()
    const fromPromise = jest.fn()
    const fromFunc = jest.fn()
    const fromAsyncFunc = jest.fn()
    const a = await service.registerAsync(Promise.resolve(new DisposableAction(fromPromise)))
    const b = await service.registerAsync(() => new DisposableAction(fromFunc))
    const c = await service.registerAsync(async () => new DisposableAction(fromAsyncFunc))
    expect(a.disposed || b.disposed || c.disposed).toBe(false)
    await service.dispose()
    expect(fromPromise).toHaveBeenCalledTimes(1)
    expect(fromFunc).toHaveBeenCalledTimes(1)
    expect(fromAsyncFunc).toHaveBeenCalledTimes(1)
  })

  it("disposes a resource that arrives after disposal as soon as it arrives", async () => {
    const service = new Service()
    const opening = service.registerAsync(async () => {
      await delay(5)
      return new DisposableAction(() => service.log.push("close late"))
    })
    await service.dispose()
    const late = await opening
    expect(late.disposed).toBe(true)
    expect(service.log).toEqual(["close late"])
  })

  it("disposes a registration made after disposal at once", async () => {
    const service = new Service()
    await service.dispose()
    const action = jest.fn()
    service.addDisposable(action)
    service.register(new DisposableAction(action))
    service.addDisposables(action)
    expect(action).toHaveBeenCalledTimes(3)
  })

  it("passes the error of a late registration to onError", async () => {
    const errors: unknown[] = []
    const service = new Service({ onError: (e) => errors.push(e) })
    await service.dispose()
    service.addDisposable(async () => {
      throw new Error("late")
    })
    await delay(1)
    expect(errors.map((e) => (e as Error).message)).toEqual(["late"])
  })

  it("passes the error of a late registration to the safe exception handler without onError", async () => {
    const errors: unknown[] = []
    safeDisposableExceptionHandlerManager.handler = (e) => errors.push(e)
    try {
      const service = new Service()
      await service.dispose()
      service.register(
        new AsyncDisposableAction(async () => {
          throw new Error("late")
        }),
      )
      await delay(1)
      expect(errors.map((e) => (e as Error).message)).toEqual(["late"])
    } finally {
      safeDisposableExceptionHandlerManager.reset()
    }
  })

  it("clears its timers when disposed", async () => {
    const service = new Service()
    const fired = jest.fn()
    const timeout = service.addTimeout(fired, 10_000, { unref: true })
    const interval = service.addInterval(fired, 10_000, { unref: true })
    await service.dispose()
    expect(timeout.disposed).toBe(true)
    expect(interval.disposed).toBe(true)
    expect(fired).not.toHaveBeenCalled()
  })

  it("lets a timeout fire and forgets it", async () => {
    const service = new Service()
    const fired = jest.fn()
    service.addTimeout(fired, 1)
    await delay(10)
    expect(fired).toHaveBeenCalledTimes(1)
    await service.dispose()
  })

  it("works with 'await using'", async () => {
    const log: string[] = []
    {
      await using service = new Service({ order: "lifo" })
      service.addDisposable(() => {
        log.push("first")
      })
      service.addDisposable(async () => {
        await delay(1)
        log.push("second")
      })
    }
    expect(log).toEqual(["second", "first"])
  })
})
