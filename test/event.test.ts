import { EventEmitter } from "node:events"
import { DisposableStore, disposableFromEvent, disposableFromEventOnce, on, once } from "../src"

describe("event", () => {
  it("should create disposable from event", () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()
    const disposable = disposableFromEvent(emitter, "event", listener)
    expect(listener).toHaveBeenCalledTimes(0)
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(1)
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(2)
    disposable.dispose()
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(2)
  })
  it("should create disposable from event with multiple listeners", () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()
    const disposable1 = disposableFromEvent(emitter, "event", listener)
    const disposable2 = disposableFromEvent(emitter, "event", listener)
    expect(listener).toHaveBeenCalledTimes(0)
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(2)
    disposable1.dispose()
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(3)
    disposable2.dispose()
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(3)
  })
  it("should be called with arguments", () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()
    const disposable = disposableFromEvent(emitter, "event", listener)
    expect(listener).toHaveBeenCalledTimes(0)
    emitter.emit("event", 1, 2, 3)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenLastCalledWith(1, 2, 3)
    disposable.dispose()
    emitter.emit("event", 4, 5, 6)
    expect(listener).toHaveBeenCalledTimes(1)
  })
  it("should create disposable from event once", () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()
    const disposable = disposableFromEventOnce(emitter, "event", listener)
    expect(listener).toHaveBeenCalledTimes(0)
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(1)
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(1)
    disposable.dispose()
    emitter.emit("event")
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe("typed event listeners", () => {
  it("accepts a listener with typed parameters", () => {
    const emitter = new EventEmitter()
    const codes: number[] = []
    const listener = (code: number, signal: string | null) => {
      codes.push(code)
      expect(signal).toBe("SIGTERM")
    }
    const subscription = on(emitter, "exit", listener)
    emitter.emit("exit", 1, "SIGTERM")
    subscription.dispose()
    emitter.emit("exit", 2, "SIGTERM")
    expect(codes).toEqual([1])
  })

  it("accepts a typed listener for a single call", () => {
    const emitter = new EventEmitter()
    const messages: string[] = []
    const subscription = once(emitter, "message", (message: string) => {
      messages.push(message)
    })
    emitter.emit("message", "a")
    emitter.emit("message", "b")
    subscription.dispose()
    expect(messages).toEqual(["a"])
  })

  it("returns a Disposiq that can be disposed with a store", () => {
    const emitter = new EventEmitter()
    const store = new DisposableStore()
    const listener = jest.fn()
    on(emitter, "event", listener).disposeWith(store)
    once(emitter, "event", listener).disposeWith(store)
    store.dispose()
    emitter.emit("event")
    expect(listener).not.toHaveBeenCalled()
  })

  it("works with a custom emitter whose listener type is narrower", () => {
    type Listener = (value: number) => void
    const listeners = new Set<Listener>()
    const emitter = {
      on(_event: "change", listener: Listener) {
        listeners.add(listener)
      },
      off(_event: "change", listener: Listener) {
        listeners.delete(listener)
      },
    }
    const values: number[] = []
    {
      using _ = disposableFromEvent(emitter, "change", (value: number) => {
        values.push(value)
      })
      for (const listener of listeners) {
        listener(1)
      }
    }
    expect(listeners.size).toBe(0)
    expect(values).toEqual([1])
  })
})

describe("once on an emitter without once", () => {
  function createEmitter() {
    type Listener = (value: number) => void
    const listeners = new Set<Listener>()
    return {
      listeners,
      on(_event: "change", listener: Listener) {
        listeners.add(listener)
      },
      off(_event: "change", listener: Listener) {
        listeners.delete(listener)
      },
      emit(value: number) {
        for (const listener of [...listeners]) {
          listener(value)
        }
      },
    }
  }

  it("calls the listener once and removes it", () => {
    const emitter = createEmitter()
    const values: number[] = []
    disposableFromEventOnce(emitter, "change", (value: number) => {
      values.push(value)
    })
    emitter.emit(1)
    emitter.emit(2)
    expect(values).toEqual([1])
    expect(emitter.listeners.size).toBe(0)
  })

  it("removes the listener when disposed before the event", () => {
    const emitter = createEmitter()
    const listener = jest.fn()
    once(emitter, "change", listener).dispose()
    emitter.emit(1)
    expect(listener).not.toHaveBeenCalled()
    expect(emitter.listeners.size).toBe(0)
  })
})
