import { Disposiq } from "./disposiq"
import { toDisposable } from "./aliases"
import type { IAsyncDisposable, IDisposable } from "./declarations"

export class WeakRefDisposable<
  T extends IDisposable | IAsyncDisposable | AbortController,
> extends Disposiq {
  private readonly _value: WeakRef<T>
  private disposed = false

  constructor(value: T) {
    super()
    this._value = new WeakRef<T>(value)
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true
    const value = this._value.deref()
    if (!value) {
      return
    }
    toDisposable(value).dispose()
  }
}
