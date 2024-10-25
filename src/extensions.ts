import { Disposiq } from "./disposiq";
import { IDisposablesContainer } from "./declarations";

Disposiq.prototype.disposeWith = function (this: Disposiq, container: IDisposablesContainer): void {
  return container.add(this)
}

Disposiq.prototype.toFunction = function (this: Disposiq): () => void {
  return () => this.dispose()
}