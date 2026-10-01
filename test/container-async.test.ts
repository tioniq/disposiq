import {
  AsyncDisposableAction,
  AsyncDisposableContainer,
  DisposableAction,
  safeDisposableExceptionHandlerManager,
} from "../src"

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function resource(log: string[], name: string, ms = 0) {
  return new AsyncDisposableAction(async () => {
    log.push(`start ${name}`)
    if (ms > 0) {
      await delay(ms)
    }
    log.push(`end ${name}`)
  })
}

describe("async container", () => {
  it("holds the value given to the constructor", async () => {
    const log: string[] = []
    const value = resource(log, "initial")
    const container = new AsyncDisposableContainer(value)
    expect(container.disposable).toBe(value)
    await container.dispose()
    expect(log).toEqual(["start initial", "end initial"])
    expect(container.disposable).toBeUndefined()
  })

  it("sets the new value at once and settles when the previous one is disposed", async () => {
    const container = new AsyncDisposableContainer<AsyncDisposableAction>()
    const log: string[] = []
    await container.set(resource(log, "first", 5))
    const second = resource(log, "second")
    const setting = container.set(second)
    expect(container.disposable).toBe(second)
    await setting
    log.push("set resolved")
    expect(log).toEqual(["start first", "end first", "set resolved"])
  })

  it("does not dispose the current value when it is set again", async () => {
    const container = new AsyncDisposableContainer()
    const action = jest.fn()
    const value = new DisposableAction(action)
    await container.set(value)
    await container.set(value)
    expect(action).not.toHaveBeenCalled()
  })

  it("rejects the set when disposing the previous value fails", async () => {
    const container = new AsyncDisposableContainer()
    await container.set(new AsyncDisposableAction(async () => {
      throw new Error("previous failed")
    }))
    await expect(container.set(null)).rejects.toThrow("previous failed")
    expect(container.disposable).toBeUndefined()
  })

  it("replaces the value without disposing the previous one", async () => {
    const container = new AsyncDisposableContainer<AsyncDisposableAction>()
    const log: string[] = []
    const first = resource(log, "first")
    await container.set(first)
    expect(container.replace(resource(log, "second"))).toBe(first)
    await container.dispose()
    expect(log).toEqual(["start second", "end second"])
  })

  it("disposes the current value and stays usable", async () => {
    const container = new AsyncDisposableContainer<AsyncDisposableAction>()
    const log: string[] = []
    await container.set(resource(log, "first", 5))
    await container.disposeCurrent()
    expect(log).toEqual(["start first", "end first"])
    expect(container.disposed).toBe(false)
    expect(container.disposable).toBeUndefined()
    await container.disposeCurrent()
    await container.set(resource(log, "second"))
    await container.dispose()
    expect(log).toEqual(["start first", "end first", "start second", "end second"])
  })

  it("waits for disposals in progress before disposing the current value", async () => {
    const container = new AsyncDisposableContainer<AsyncDisposableAction>()
    const log: string[] = []
    await container.set(resource(log, "previous", 20))
    void container.set(resource(log, "current"))
    await container.dispose()
    expect(log).toEqual(["start previous", "end previous", "start current", "end current"])
  })

  it("shares one disposal between concurrent calls, rejects with its error, and resolves later calls", async () => {
    const container = new AsyncDisposableContainer()
    await container.set(new AsyncDisposableAction(async () => {
      await delay(5)
      throw new Error("current failed")
    }))
    const first = container.dispose()
    expect(container.disposed).toBe(true)
    expect(container.dispose()).toBe(first)
    await expect(first).rejects.toThrow("current failed")
    await expect(container.dispose()).resolves.toBeUndefined()
  })

  it("disposes a value set on a disposed container", async () => {
    const container = new AsyncDisposableContainer()
    await container.dispose()
    const action = jest.fn()
    await container.set(new DisposableAction(action))
    await container.set(undefined)
    expect(action).toHaveBeenCalledTimes(1)
    expect(container.disposable).toBeUndefined()
  })

  it("disposes a value replaced on a disposed container and reports its error to the safe handler", async () => {
    const errors: unknown[] = []
    safeDisposableExceptionHandlerManager.handler = (e) => errors.push(e)
    try {
      const container = new AsyncDisposableContainer()
      await container.dispose()
      expect(container.replace(new AsyncDisposableAction(async () => {
        throw new Error("late")
      }))).toBeUndefined()
      expect(container.replace(null)).toBeUndefined()
      await delay(1)
      expect(errors.map((e) => (e as Error).message)).toEqual(["late"])
    } finally {
      safeDisposableExceptionHandlerManager.reset()
    }
  })

  it("is disposed at the end of an 'await using' scope", async () => {
    const log: string[] = []
    {
      await using container = new AsyncDisposableContainer(resource(log, "value", 1))
      expect(container.disposed).toBe(false)
    }
    expect(log).toEqual(["start value", "end value"])
  })
})
