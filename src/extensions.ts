import { Disposiq } from "./disposiq"
import type { IDisposablesContainer } from "./declarations"
import { Disposable } from "./disposable"

Disposiq.prototype.disposeWith = function (
  this: Disposiq,
  container: IDisposablesContainer | Disposable,
): void {
  if (container instanceof Disposable) {
    container.addDisposable(this)
    return
  }
  container.add(this)
}

Disposiq.prototype.toFunction = function (this: Disposiq): () => void {
  return () => {
    this.dispose()
  }
}

const g =
  typeof global !== "undefined"
    ? global
    : typeof window !== "undefined"
      ? window
      : typeof self !== "undefined"
        ? self
        : this

Disposiq.prototype.disposeIn = function (this: Disposiq, ms: number): void {
  g.setTimeout(() => {
    this.dispose()
  }, ms)
}
