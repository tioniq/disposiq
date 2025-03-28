import type { DisposableCompat, IDisposable, IDisposablesContainer } from "./declarations"
import type { Disposable } from "./disposable"

/**
 * Disposiq is a base class for disposables. The only reason is to have ability to extend it with additional functionality.
 */
export abstract class Disposiq implements DisposableCompat {
  /**
   * Dispose the object. If the object has already been disposed, this should be a no-op
   */
  abstract dispose(): void

  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose](): void {
    this.dispose()
  }
}

/**
 * AsyncDisposiq is a base class for disposables that can be disposed asynchronously.
 */
export abstract class AsyncDisposiq extends Disposiq {
  /**
   * Dispose the object in async way. Should return the Promise. If the object has already been disposed, this should
   * be a no-op
   */
  abstract dispose(): Promise<void>

  /**
   * Support for the internal Disposable API
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.dispose()
  }
}

export interface Disposiq {
  /**
   * Dispose the object when the container is disposed.
   * @param container a container to add the disposable to
   */
  disposeWith(container: IDisposablesContainer | Disposable): void

  /**
   * Dispose the object after a specified time.
   * @param ms time in milliseconds
   */
  disposeIn(ms: number): void

  /**
   * Convert the object to a function that disposes the object.
   */
  toFunction(): () => void

  /**
   * Convert the object to a plain object with a dispose method.
   */
  toPlainObject(): IDisposable

  /**
   * Embeds the current object to extend its functionality by combining
   * its properties and behaviors with the IDisposable type. This method
   * modifies the current object to include the dispose method.
   *
   * @param {T} obj - The object to be embedded with the IDisposable type.
   * @template T - The type of the current object.
   * @return {T & IDisposable} - The `obj` object with the dispose method added.
   */
  embedTo<T extends object>(obj: T): T & IDisposable

  /**
   * Converts the object to a safe disposable object that catches errors during disposal.
   * Optionally, an error callback can be supplied to handle any errors that occur.
   *
   * @param [errorCallback] An optional callback function that handles errors. The function receives the error
   * as its parameter.
   * @return {Disposiq} A safe version of the current instance ensuring error resilience.
   */
  toSafe(errorCallback?: (e: unknown) => void): Disposiq
}


export interface AsyncDisposiq {
  /**
   * Converts the current instance to a safe version, suppressing potential errors during execution.
   * Optionally, an error callback can be supplied to handle any errors that occur.
   *
   * @param [errorCallback] An optional callback function that handles errors. The function receives the error
   * as its parameter.
   * @return {AsyncDisposiq} A safe version of the current instance ensuring error resilience.
   */
  toSafe(errorCallback?: (e: unknown) => void): AsyncDisposiq
}