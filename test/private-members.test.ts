import { AsyncDisposable, Disposable } from "../src"

describe("private members of the base classes", () => {
  it("a subclass of Disposable cannot declare _store", () => {
    class FieldClash extends Disposable {
      // @ts-expect-error _store is a private member of Disposable
      _store = new Map<string, number>()
    }

    class MethodClash extends Disposable {
      // @ts-expect-error _store is a private member of Disposable
      _store(_id: string): void {}
    }

    class AsyncMethodClash extends Disposable {
      // @ts-expect-error _store is a private member of Disposable
      async _store(_id: string): Promise<number> {
        return 1
      }
    }

    expect([FieldClash, MethodClash, AsyncMethodClash]).toHaveLength(3)
  })

  it("a subclass of AsyncDisposable cannot declare _store or _onError", () => {
    class FieldClash extends AsyncDisposable {
      // @ts-expect-error _store is a private member of AsyncDisposable
      _store = new Map<string, number>()
    }

    class MethodClash extends AsyncDisposable {
      // @ts-expect-error _store is a private member of AsyncDisposable
      _store(_id: string): void {}
    }

    class OnErrorClash extends AsyncDisposable {
      // @ts-expect-error _onError is a private member of AsyncDisposable
      _onError = 1
    }

    expect([FieldClash, MethodClash, OnErrorClash]).toHaveLength(3)
  })

  it("a subclass with its own members compiles", () => {
    class Plain extends Disposable {
      store = new Map<string, number>()
    }

    class PlainAsync extends AsyncDisposable {
      store = new Map<string, number>()
    }

    expect(new Plain().store.size).toBe(0)
    expect(new PlainAsync().store.size).toBe(0)
  })
})
