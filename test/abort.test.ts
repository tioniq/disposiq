import { AbortDisposable } from "../src"

describe("abort", () => {
  it("should be aborted", () => {
    const controller = new AbortController()
    const disposable = new AbortDisposable(controller)
    expect(controller.signal.aborted).toBe(false)
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(controller.signal.aborted).toBe(true)
    expect(disposable.disposed).toBe(true)
  })
  it("should the disposable signal be the same as the controller signal", () => {
    const controller = new AbortController()
    const disposable = new AbortDisposable(controller)
    expect(disposable.signal).toBe(controller.signal)
    disposable.dispose()
    expect(disposable.signal).toBe(controller.signal)
  })
  it("Dispose using the internal API", () => {
    const controller = new AbortController()
    const disposable = new AbortDisposable(controller)
    expect(controller.signal.aborted).toBe(false)
    expect(disposable.disposed).toBe(false)
    {
      using _ = disposable
    }
    expect(controller.signal.aborted).toBe(true)
    expect(disposable.disposed).toBe(true)
  })
})
