import { createDisposable, type IDisposable, WeakRefDisposable } from "../src"
import "expose-gc"

describe("weak-ref-disposable", () => {
  it("should call dispose on live object", () => {
    const fn = jest.fn()
    const disposable = createDisposable(fn)
    const weakRefDisposable = new WeakRefDisposable(disposable)

    expect(fn).not.toHaveBeenCalled()
    weakRefDisposable.dispose()
    expect(fn).toHaveBeenCalled()
  })

  it("should not fail on dead object", async () => {
    const fn = jest.fn()

    function createWeakRefDisposable() {
      const disposable = createDisposable(fn)
      return new WeakRefDisposable(disposable)
    }

    const weakRefDisposable = createWeakRefDisposable()

    const disposableWeakRef = weakRefDisposable as unknown as {
      _value: {
        deref(): IDisposable | undefined
      }
    }

    // Enqueue a micro task
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Force garbage collection
    global.gc()

    // The WeakRef should now be empty
    expect(disposableWeakRef._value.deref()).toBeUndefined()

    // Verify that no unexpected exceptions occur
    expect(() => weakRefDisposable.dispose()).not.toThrow()
    expect(fn).not.toHaveBeenCalled()
  })

  it("should not fail if dispose twice", () => {
    const fn = jest.fn()
    const disposable = createDisposable(fn)
    const weakRefDisposable = new WeakRefDisposable(disposable)

    expect(fn).not.toHaveBeenCalled()
    weakRefDisposable.dispose()
    expect(fn).toHaveBeenCalled()
    weakRefDisposable.dispose()
  })

  it("constructor should accept WeakRef as a param", () => {
    const fn = jest.fn()
    const disposable = createDisposable(fn)
    // @ts-ignore
    const weakRef = new WeakRef(disposable)
    const weakRefDisposable = new WeakRefDisposable(weakRef)

    expect(fn).not.toHaveBeenCalled()
    weakRefDisposable.dispose()
    expect(fn).toHaveBeenCalled()
  })
})
