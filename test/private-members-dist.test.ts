import { readFileSync } from "node:fs"
import { join } from "node:path"

type Dist = typeof import("../dist")

declare const dist: Dist

/**
 * Compiled by ts-jest against the built `dist/index.d.ts` and never called: the `@ts-expect-error` directives fail
 * the compilation when the published types stop declaring the private members
 */
export function publishedTypesRejectPrivateMemberClashes(): void {
  // @ts-expect-error _store is a private member of Disposable
  class FieldClash extends dist.Disposable {
    _store = new Map<string, number>()
  }

  // @ts-expect-error _store is a private member of Disposable
  class MethodClash extends dist.Disposable {
    _store(_id: string): void {}
  }

  // @ts-expect-error _store is a private member of AsyncDisposable
  class AsyncFieldClash extends dist.AsyncDisposable {
    _store = new Map<string, number>()
  }

  // @ts-expect-error _store is a private member of AsyncDisposable
  class AsyncMethodClash extends dist.AsyncDisposable {
    async _store(_id: string): Promise<number> {
      return 1
    }
  }

  // @ts-expect-error _onError is a private member of AsyncDisposable
  class OnErrorClash extends dist.AsyncDisposable {
    _onError = 1
  }

  return void [FieldClash, MethodClash, AsyncFieldClash, AsyncMethodClash, OnErrorClash]
}

describe("published type definitions", () => {
  it("declare the private members of the base classes", () => {
    const types = readFileSync(join(__dirname, "../dist/index.d.ts"), "utf8")

    expect(types).toMatch(/private readonly _store;/)
    expect(types).toMatch(/private readonly _onError;/)
  })
})
