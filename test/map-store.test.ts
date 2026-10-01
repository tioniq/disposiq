import { DisposableMapStore } from "../src"

describe("map store", () => {
  it("should be disposed", () => {
    const store = new DisposableMapStore()
    expect(store.disposed).toBe(false)
    store.dispose()
    expect(store.disposed).toBe(true)
  })

  it("should set and get a disposable value", () => {
    const store = new DisposableMapStore<string>()
    const disposable = { dispose: jest.fn() }
    store.set("key", disposable)
    expect(store.get("key")).toBe(disposable)
  })

  it("should accept a function as a disposable value", () => {
    const store = new DisposableMapStore<string>()
    const disposable = jest.fn()
    store.set("key", disposable)
    expect(disposable).not.toHaveBeenCalled()
    store.dispose()
    expect(disposable).toHaveBeenCalled()
  })

  it("should dispose previous disposable value when setting a new value", () => {
    const store = new DisposableMapStore<string>()
    const disposable1 = { dispose: jest.fn() }
    const disposable2 = { dispose: jest.fn() }
    store.set("key", disposable1)
    store.set("key", disposable2)
    expect(disposable1.dispose).toHaveBeenCalled()
  })

  it("should delete a disposable value", () => {
    const store = new DisposableMapStore<string>()
    const disposable = { dispose: jest.fn() }
    store.set("key", disposable)
    expect(store.delete("key")).toBe(true)
    expect(disposable.dispose).toHaveBeenCalled()
  })

  it("should extract a disposable value", () => {
    const store = new DisposableMapStore<string>()
    const disposable = { dispose: jest.fn() }
    store.set("key", disposable)
    expect(store.extract("key")).toBe(disposable)
    expect(disposable.dispose).not.toHaveBeenCalled()
    expect(store.get("key")).toBeUndefined()
  })

  it("should extract not fail when no key is found", () => {
    const store = new DisposableMapStore<string>()
    store.set("key", { dispose: jest.fn() })
    expect(store.extract("notExistingKey")).toBeUndefined()
  })

  it("should not return a value when disposed", () => {
    const store = new DisposableMapStore<string>()
    store.set("key", { dispose: jest.fn() })
    store.dispose()
    expect(store.get("key")).toBeUndefined()
  })

  it("should not fail when dispose twice", () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.dispose()
  })

  it("should not fail when set a value after disposed", () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.set("key", { dispose: jest.fn() })
  })

  it("should not fail when get a value after disposed", () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.get("key")
  })

  it("should not fail when delete a value after disposed", () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.delete("key")
  })

  it("should not fail when extract a value after disposed", () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.extract("key")
  })

  it("should not fail when delete a value that does not exist", () => {
    const store = new DisposableMapStore<string>()
    store.delete("key")
  })
})

describe("map store disposal semantics", () => {
  it("does not dispose a value that is set again for the same key", () => {
    const store = new DisposableMapStore<string>()
    const value = { dispose: jest.fn() }
    store.set("a", value)
    store.set("a", value)
    expect(value.dispose).not.toHaveBeenCalled()
    expect(store.get("a")).toBe(value)
    store.dispose()
    expect(value.dispose).toHaveBeenCalledTimes(1)
  })
  it("disposes the remaining values when one throws", () => {
    const store = new DisposableMapStore<string>()
    const after = { dispose: jest.fn() }
    store.set("a", {
      dispose: () => {
        throw new Error("boom")
      },
    })
    store.set("b", after)
    expect(() => store.dispose()).toThrow("boom")
    expect(after.dispose).toHaveBeenCalledTimes(1)
    expect((store as unknown as { _map: Map<string, unknown> })._map.size).toBe(0)
  })
})

describe("typed map store", () => {
  class Stream {
    readonly dispose = jest.fn()

    constructor(readonly name: string) {
    }
  }

  it("returns the stored type from get, extract and iteration", () => {
    const store = new DisposableMapStore<string, Stream>()
    const a = new Stream("a")
    const b = new Stream("b")
    store.set("a", a)
    store.set("b", b)
    expect(store.get("a")?.name).toBe("a")
    expect(store.size).toBe(2)
    expect(store.has("a")).toBe(true)
    expect(store.has("c")).toBe(false)
    expect(Array.from(store.keys())).toEqual(["a", "b"])
    expect(Array.from(store.values()).map((s) => s.name)).toEqual(["a", "b"])
    expect(Array.from(store.entries()).map(([k, s]) => `${k}=${s.name}`)).toEqual(["a=a", "b=b"])
    expect(Array.from(store).map(([k]) => k)).toEqual(["a", "b"])
    const extracted: Stream | undefined = store.extract("a")
    expect(extracted).toBe(a)
    expect(a.dispose).not.toHaveBeenCalled()
    expect(store.size).toBe(1)
  })

  it("accepts only the stored type", () => {
    const store = new DisposableMapStore<string, Stream>()
    // @ts-expect-error a function is not a Stream
    store.set("a", () => {})
    store.dispose()
  })

  it("is empty once disposed, and disposes every value", () => {
    const store = new DisposableMapStore<number, Stream>()
    const a = new Stream("a")
    store.set(1, a)
    store.dispose()
    expect(a.dispose).toHaveBeenCalledTimes(1)
    expect(store.size).toBe(0)
    expect(store.has(1)).toBe(false)
    expect(Array.from(store)).toEqual([])
  })

  it("is disposed at the end of a 'using' scope", () => {
    const a = new Stream("a")
    {
      using store = new DisposableMapStore<string, Stream>()
      store.set("a", a)
    }
    expect(a.dispose).toHaveBeenCalledTimes(1)
  })
})
