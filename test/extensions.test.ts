import { Disposable, DisposableAction, DisposableStore } from "../src"

describe("disposeWith extension", () => {
  it("should disposeWith add a disposable to a store", () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const store = new DisposableStore()

    disposable.disposeWith(store)

    expect(disposable.disposed).toBe(false)

    store.dispose()

    expect(disposable.disposed).toBe(true)
  })

  it("should disposeWith add a disposable to a Disposable class", () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const store = new (class extends Disposable {
    })()

    disposable.disposeWith(store)

    expect(disposable.disposed).toBe(false)

    store.dispose()

    expect(disposable.disposed).toBe(true)
  })
})

describe("toFunction extension", () => {
  it("should return a function that disposes the store", () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const dispose = disposable.toFunction()

    expect(typeof dispose).toBe("function")
    expect(disposable.disposed).toBe(false)

    dispose()

    expect(disposable.disposed).toBe(true)
  })
})

describe("disposeIn extension", () => {
  beforeAll(() => {
    jest.useFakeTimers({
      advanceTimers: true,
    })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it("should dispose the store after a delay", async () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const delay = 100
    disposable.disposeIn(delay)

    expect(disposable.disposed).toBe(false)

    await new Promise((resolve) => setTimeout(resolve, delay))

    expect(disposable.disposed).toBe(true)
  })
})

describe('toPlainObject extension', () => {
  it("should return plain object", () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const plainObject = disposable.toPlainObject()

    expect(typeof plainObject).toBe("object")
    expect(typeof plainObject.dispose).toBe("function")
    expect(disposable.constructor).not.toBe({}.constructor)
    expect(plainObject.constructor).toBe({}.constructor)

    plainObject.dispose()

    expect(disposable.disposed).toBe(true)
  })
})

describe("embedTo extension", () => {
  it("should embed to a plain object", () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const obj = {}

    const embeddedObj = disposable.embedTo(obj)

    expect(embeddedObj).toBe(obj)
    expect(typeof embeddedObj.dispose).toBe("function")

    embeddedObj.dispose()

    expect(disposable.disposed).toBe(true)
  })

  it("should embed to an object with dispose method", () => {
    const originalDispose = jest.fn()
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const obj = {
      dispose: originalDispose
    }

    const embeddedObj = disposable.embedTo(obj)

    expect(embeddedObj).toBe(obj)
    expect(typeof embeddedObj.dispose).toBe("function")

    embeddedObj.dispose()

    expect(disposable.disposed).toBe(true)
    expect(originalDispose).toHaveBeenCalled()
  })
})