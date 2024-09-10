import {EventEmitter} from "node:events";
import {disposableFromEvent, disposableFromEventOnce} from "../src";

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