import {disposeAll, disposeAllUnsafe} from "../src/dispose-batch";
import {DisposableLike, IDisposable} from "../src";

describe('dispose-all-unsafe', () => {
  it("should dispose all disposables", () => {
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    const disposables = [disposable1, disposable2]
    disposeAllUnsafe(disposables)
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
    const disposable3 = {dispose: jest.fn()}
    disposables.push(disposable3)
    expect(disposables.length).toBe(1)
    disposeAllUnsafe(disposables)
    expect(disposable3.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("should not fail on null", () => {
    const disposable1 = {dispose: jest.fn()}
    const disposable2: IDisposable | null = null
    const disposables: IDisposable[] = [disposable1, disposable2]
    disposeAllUnsafe(disposables)
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("should handle empty array", () => {
    const disposables: IDisposable[] = []
    disposeAllUnsafe(disposables)
    expect(disposables.length).toBe(0)
  })
  it("should handle array with null", () => {
    const disposables = [null as unknown as IDisposable]
    disposeAllUnsafe(disposables)
    expect(disposables.length).toBe(0)
  })
  it("should handle function", () => {
    const func = jest.fn()
    const disposables = [func]
    disposeAllUnsafe(disposables)
    expect(func).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("unsafe push", () => {
    const disposables: DisposableLike[] = []
    const disposable2 = {dispose: jest.fn()}
    const disposable1 = {
      dispose: () => {
        disposables.push(disposable2)
      }
    }
    disposables.push(disposable1)
    disposeAllUnsafe(disposables)
    expect(disposable2.dispose).toHaveBeenCalled()
  })
})

describe('dispose-all-safe', () => {
  it("should dispose all disposables", () => {
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    const disposables = [disposable1, disposable2]
    disposeAll(disposables)
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposable2.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
    const disposable3 = {dispose: jest.fn()}
    disposables.push(disposable3)
    expect(disposables.length).toBe(1)
    disposeAll(disposables)
    expect(disposable3.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("should not failed on null", () => {
    const disposable1 = {dispose: jest.fn()}
    const disposable2: IDisposable = null
    const disposables = [disposable1, disposable2]
    disposeAll(disposables as unknown as IDisposable[])
    expect(disposable1.dispose).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("should handle array with null", () => {
    const disposables = [null as unknown as IDisposable]
    disposeAll(disposables)
    expect(disposables.length).toBe(0)
  })
  it("should handle empty array", () => {
    const disposables: IDisposable[] = []
    disposeAll(disposables)
    expect(disposables.length).toBe(0)
  })
  it("should handle function", () => {
    const func = jest.fn()
    const disposables = [func]
    disposeAll(disposables)
    expect(func).toHaveBeenCalled()
    expect(disposables.length).toBe(0)
  })
  it("safe push", () => {
    const disposables: DisposableLike[] = []
    const disposable2 = {dispose: jest.fn()}
    const disposable1 = {
      dispose: () => {
        disposables.push(disposable2)
      }
    }
    disposables.push(disposable1)
    disposeAll(disposables)
    expect(disposable2.dispose).not.toHaveBeenCalled()
  })
})
