import {DisposableAwareCompat, IDisposable} from "./declarations";
import {Disposiq} from "./disposiq";

/**
 * A container for a disposable object. It can be replaced with another disposable object.
 * When disposed, it will dispose the current disposable object and all future disposable objects
 * @example
 * const container = new DisposableContainer()
 * container.set(createDisposable(() => console.log("disposed")))
 * container.dispose() // disposed
 * container.set(createDisposable(() => console.log("disposed again"))) // disposed again
 */
export class DisposableContainer extends Disposiq implements DisposableAwareCompat {
  /**
   * @internal
   */
  private _disposable: IDisposable | undefined

  /**
   * @internal
   */
  private _disposed: boolean = false

  constructor(disposable: IDisposable | undefined = undefined) {
    super()
    this._disposable = disposable
  }

  /**
   * Returns true if the container is disposed
   */
  get disposed(): boolean {
    return this._disposed
  }

  /**
   * Returns the current disposable object
   */
  get disposable(): IDisposable | undefined {
    return this._disposable
  }

  /**
   * Set the new disposable and dispose the old one
   * @param disposable a new disposable to set
   */
  set(disposable: IDisposable): void {
    if (this._disposed) {
      disposable.dispose()
      return
    }
    const oldDisposable = this._disposable
    this._disposable = disposable
    if (oldDisposable != undefined) {
      oldDisposable.dispose()
    }
  }

  /**
   * Replace the disposable with a new one. Does not dispose the old one
   * @param disposable a new disposable to replace the old one
   */
  replace(disposable: IDisposable): void {
    if (this._disposed) {
      disposable.dispose()
      return
    }
    this._disposable = disposable
  }

  /**
   * Dispose only the current disposable object without affecting the container's state.
   */
  disposeCurrent(): void {
    const disposable = this._disposable
    if (disposable != undefined) {
      this._disposable = undefined;
      disposable.dispose();
    }
  }

  dispose(): void {
    if (this._disposed) {
      return
    }
    this._disposed = true
    if (this._disposable == undefined) {
      return;
    }
    this._disposable.dispose()
    this._disposable = undefined
  }
}