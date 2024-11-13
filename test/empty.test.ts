import { emptyDisposable } from "../src"

describe("empty disposable", () => {
  it("should not throw", () => {
    expect(() => emptyDisposable.dispose()).not.toThrow()
  })

  it("should not throw async", async () => {
    await expect(emptyDisposable.dispose()).resolves.not.toThrow()
  })

  it("should not throw System", () => {
    expect(() => emptyDisposable[Symbol.dispose]()).not.toThrow()
  })

  it("should not throw async System", async () => {
    await expect(emptyDisposable[Symbol.asyncDispose]()).resolves.not.toThrow()
  })

  it("should not throw when auto disposed", () => {
    {
      using d = emptyDisposable
    }
    expect(true).toBe(true)
  })
})
