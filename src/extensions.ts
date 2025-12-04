import type { IDisposable, IDisposablesContainer } from "./declarations"
import { Disposable } from "./disposable"
import { AsyncDisposiq, Disposiq } from "./disposiq"

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

const g = globalThis

Disposiq.prototype.disposeIn = function (this: Disposiq, ms: number): void {
  g.setTimeout(() => {
    this.dispose()
  }, ms)
}

Disposiq.prototype.toPlainObject = function (this: Disposiq): IDisposable {
  return {
    dispose: () => {
      this.dispose()
    }
  }
}

Disposiq.prototype.embedTo = function <T extends object>(this: Disposiq, obj: T): T & IDisposable {
  if ("dispose" in obj && typeof obj.dispose === "function") {
    const objDispose = obj.dispose
    obj.dispose = () => {
      objDispose.call(obj)
      this.dispose()
    }
    return obj as T & IDisposable
  }
  (obj as T & IDisposable).dispose = () => {
    this.dispose()
  }
  return obj as T & IDisposable
}

Disposiq.prototype.toSafe = function (this: Disposiq, errorCallback?: (e: unknown) => void): Disposiq {
  const self = this
  return new class extends Disposiq {
    dispose(): void {
      try {
        self.dispose()
      } catch (e) {
        if (errorCallback) {
          errorCallback(e)
        }
      }
    }
  }
}

AsyncDisposiq.prototype.toSafe = function (this: AsyncDisposiq, errorCallback?: (e: unknown) => void): AsyncDisposiq {
  const self = this
  return new class extends AsyncDisposiq {
    async dispose(): Promise<void> {
      try {
        await self.dispose()
      } catch (e) {
        if (errorCallback) {
          errorCallback(e)
        }
      }
    }
  }
}