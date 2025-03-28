import type {
  CanBeDisposable,
  DisposableCompat,
  IDisposable,
} from "./declarations"
import { emptyDisposable } from "./empty"
import { AsyncDisposableAction, DisposableAction } from "./action"
import { AbortDisposable } from "./abort"
import { Disposiq } from "./disposiq"
import { CancellationTokenDisposable } from "./cancellation";

/**
 * Create a disposable from a disposable like object. The object can be a function, an object with a dispose method,
 * an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method.
 * @param disposableLike a disposable like object
 * @returns a disposable object. If the input is already a disposable object, it will be returned as is.
 * If the input is a function, it will be wrapped in a DisposableAction object.
 * If the input has internal Symbol.dispose/Symbol.asyncDispose method, it will be wrapped in a DisposableAction object.
 * If the input is an AbortController, it will be wrapped in an AbortDisposable object.
 * If the input is invalid, an empty disposable object will be returned.
 */
export function createDisposable(
  disposableLike: CanBeDisposable | null | undefined
): IDisposable {
  if (!disposableLike) {
    return emptyDisposable
  }
  if (typeof disposableLike === "object" && "dispose" in disposableLike) {
    return disposableLike
  }
  return createDisposiqFrom(disposableLike)
}

/**
 * Create a system-compatible disposable from a disposable like object. The object can be a function, an object with a dispose method,
 * an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method. This function is used to create
 * a disposable object that is compatible with the system's internal disposable object
 * @param disposableLike a disposable like object
 * @returns a disposable object. If the input is already a disposable object with Symbol.dispose/Symbol.asyncDispose, it will be returned as is.
 * If the input is a function, it will be wrapped in a DisposableAction object.
 * If the input has internal Symbol.dispose/Symbol.asyncDispose method, it will be wrapped in a DisposableAction object.
 * If the input is an AbortController, it will be wrapped in an AbortDisposable object.
 * If the input is invalid, an empty disposable object will be returned.
 */
export function createDisposableCompat(
  disposableLike: CanBeDisposable | null | undefined
): DisposableCompat {
  return createDisposiqFrom(disposableLike)
}

/**
 * Create a Disposiq-inherited object from a disposable like object. The object can be a function, an object with a
 * dispose method, an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method. This
 * function is used to create a Disposiq instance that is compatible with all extensions of Disposiq
 * @param disposableLike a disposable like object
 * @returns a Disposiq object. If the input is already a Disposiq object, it will be returned as is.
 */
export function createDisposiq(
  disposableLike: CanBeDisposable | null | undefined
): Disposiq {
  return createDisposiqFrom(disposableLike)
}

function createDisposiqFrom(disposableLike: CanBeDisposable): Disposiq {
  if (!disposableLike) {
    return emptyDisposable
  }
  if (disposableLike instanceof Disposiq) {
    return disposableLike
  }
  if (typeof disposableLike === "function") {
    return new DisposableAction(disposableLike)
  }
  if (typeof disposableLike !== "object") {
    return emptyDisposable
  }
  if ("dispose" in disposableLike) {
    return new DisposableAction(() => {
      disposableLike.dispose()
    })
  }
  if (Symbol.dispose in disposableLike) {
    return new DisposableAction(() => {
      disposableLike[Symbol.dispose]()
    })
  }
  if (Symbol.asyncDispose in disposableLike) {
    return new AsyncDisposableAction(async () => {
      await disposableLike[Symbol.asyncDispose]()
    })
  }
  if ("unref" in disposableLike) {
    // @ts-ignore
    return new DisposableAction(() => disposableLike.unref())
  }
  if (disposableLike instanceof AbortController) {
    // @ts-ignore
    return new AbortDisposable(disposableLike)
  }
  if ("cancel" in disposableLike) {
    return new CancellationTokenDisposable(disposableLike)
  }
  return emptyDisposable
}
