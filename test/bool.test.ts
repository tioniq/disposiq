import { BoolDisposable } from "../src"

describe("bool", () => {
  it("should be disposed", () => {
    const disposable = new BoolDisposable()
    expect(disposable.disposed).toBe(false)
    disposable.dispose()
    expect(disposable.disposed).toBe(true)
  })
  it("can use global Disposable API", () => {
    let disposable: BoolDisposable
    {
      using _ = new BoolDisposable()
      disposable = _
      expect(_.disposed).toBe(false)
    }
    expect(disposable.disposed).toBe(true)
  })
})
