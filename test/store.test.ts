import {DisposableStore, IDisposable} from "../src";

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
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    const disposable3 = {dispose: jest.fn()}
    disposable.add(disposable1, disposable2)
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
    disposable.add(disposable3)
    expect(disposable3.dispose).toHaveBeenCalled()
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
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    disposable.add(disposable1, disposable2)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable", () => {
    const disposable = new DisposableStore()
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    disposable.add(disposable1, disposable2)
    disposable.remove(disposable1)
    disposable.dispose()
    expect(disposable1.dispose).not.toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
  })
  it("can remove a disposable that does not exist", () => {
    const disposable = new DisposableStore()
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    disposable.add(disposable1)
    expect(disposable.remove(disposable2)).toBe(false)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
  })
  it("should not dispose twice", () => {
    const disposable = new DisposableStore()
    const disposable1 = {dispose: jest.fn()}
    disposable.add(disposable1)
    disposable.dispose()
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalledTimes(1)
  })
  it("supports adding a single disposable", () => {
    const disposable = new DisposableStore()
    const disposable1 = {dispose: jest.fn()}
    disposable.addOne(disposable1)
    disposable.dispose()
    expect(disposable1.dispose).toHaveBeenCalled()
    const disposable2 = {dispose: jest.fn()}
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
  it("should dispose only current disposables", () => {
    const disposable = new DisposableStore()
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    disposable.add(disposable1)
    disposable.disposeCurrent()
    expect(disposable1.dispose).toHaveBeenCalled()
    disposable.add(disposable2)
    expect(disposable2.dispose).not.toHaveBeenCalled()
    disposable.dispose()
    expect(disposable2.dispose).toHaveBeenCalled()
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
})