import { DisposableAction, DisposableStore } from "../src"

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
