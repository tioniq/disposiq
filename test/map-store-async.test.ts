import { AsyncDisposableAction, AsyncDisposableMapStore, DisposableAction } from "../src"

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

describe("async map store", () => {
  it("reads like a map", () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    const a = resource(log, "a")
    const b = resource(log, "b")
    store.set("a", a)
    store.set("b", b)
    expect(store.get("a")).toBe(a)
    expect(store.get("c")).toBeUndefined()
    expect(store.has("b")).toBe(true)
    expect(store.size).toBe(2)
    expect(Array.from(store.keys())).toEqual(["a", "b"])
    expect(Array.from(store.values())).toEqual([a, b])
    expect(Array.from(store.entries())).toEqual([["a", a], ["b", b]])
    expect(Array.from(store)).toEqual([["a", a], ["b", b]])
  })

  it("waits for the replaced value to be disposed", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    await store.set("k", resource(log, "first", 5))
    await store.set("k", resource(log, "second"))
    log.push("set resolved")
    expect(log).toEqual(["start first", "end first", "set resolved"])
  })

  it("does not dispose a value set again under the same key", async () => {
    const store = new AsyncDisposableMapStore<string>()
    const action = jest.fn()
    const value = new DisposableAction(action)
    await store.set("k", value)
    await store.set("k", value)
    expect(action).not.toHaveBeenCalled()
  })

  it("rejects the set when disposing the replaced value fails", async () => {
    const store = new AsyncDisposableMapStore<string>()
    await store.set("k", new AsyncDisposableAction(async () => {
      throw new Error("release failed")
    }))
    await expect(store.set("k", new DisposableAction(jest.fn()))).rejects.toThrow("release failed")
  })

  it("deletes and disposes a value", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    await store.set("k", resource(log, "k", 5))
    await expect(store.delete("k")).resolves.toBe(true)
    expect(log).toEqual(["start k", "end k"])
    await expect(store.delete("k")).resolves.toBe(false)
    expect(store.size).toBe(0)
  })

  it("extracts a value without disposing it", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    const value = resource(log, "k")
    await store.set("k", value)
    expect(store.extract("k")).toBe(value)
    expect(store.extract("k")).toBeUndefined()
    await store.dispose()
    expect(log).toEqual([])
  })

  it("disposes every value in insertion order, one after another", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    await store.set("a", resource(log, "a", 5))
    await store.set("b", resource(log, "b"))
    await store.dispose()
    expect(log).toEqual(["start a", "end a", "start b", "end b"])
    expect(store.disposed).toBe(true)
    expect(store.size).toBe(0)
  })

  it("waits for disposals already in progress", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    await store.set("a", resource(log, "replaced", 20))
    void store.set("a", resource(log, "current"))
    await store.dispose()
    expect(log).toEqual(["start replaced", "end replaced", "start current", "end current"])
  })

  it("is not stopped by a disposal in progress that fails", async () => {
    const store = new AsyncDisposableMapStore<string>()
    const action = jest.fn()
    await store.set("a", new AsyncDisposableAction(async () => {
      await delay(5)
      throw new Error("replaced failed")
    }))
    const replacing = store.set("a", new DisposableAction(action)).then((): undefined => undefined, (e: Error) => e.message)
    await store.dispose()
    await expect(replacing).resolves.toBe("replaced failed")
    expect(action).toHaveBeenCalledTimes(1)
  })

  it("disposes every value past an error and rejects with it", async () => {
    const store = new AsyncDisposableMapStore<string>()
    const action = jest.fn()
    await store.set("a", new AsyncDisposableAction(async () => {
      throw new Error("a failed")
    }))
    await store.set("b", new DisposableAction(action))
    await expect(store.dispose()).rejects.toThrow("a failed")
    expect(action).toHaveBeenCalledTimes(1)
  })

  it("shares one disposal between concurrent calls and resolves later calls", async () => {
    const store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
    const log: string[] = []
    await store.set("a", resource(log, "a", 5))
    const first = store.dispose()
    expect(store.dispose()).toBe(first)
    await first
    await store.dispose()
    expect(log).toEqual(["start a", "end a"])
  })

  it("disposes a value set on a disposed store", async () => {
    const store = new AsyncDisposableMapStore<string>()
    await store.dispose()
    const action = jest.fn()
    await store.set("k", new DisposableAction(action))
    expect(action).toHaveBeenCalledTimes(1)
    expect(store.has("k")).toBe(false)
  })

  it("is disposed at the end of an 'await using' scope", async () => {
    const log: string[] = []
    {
      await using store = new AsyncDisposableMapStore<string, AsyncDisposableAction>()
      await store.set("a", resource(log, "a", 1))
    }
    expect(log).toEqual(["start a", "end a"])
  })
})
