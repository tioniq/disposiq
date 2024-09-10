import {DisposableCompat, DisposableLike, IDisposable} from "./declarations";
import {emptyDisposable} from "./empty";
import {AsyncDisposableAction, DisposableAction} from "./action";
import {AbortDisposable} from "./abort";

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
export function createDisposable(disposableLike: DisposableLike | Disposable | AsyncDisposable | AbortController): IDisposable {
  if (!disposableLike) {
    return emptyDisposable
  }
  if (typeof disposableLike === 'function') {
    return new DisposableAction(disposableLike)
  }
  if (typeof disposableLike === 'object') {
    if ("dispose" in disposableLike) {
      return disposableLike
    }
    if (Symbol.dispose in disposableLike) {
      return new DisposableAction(() => {
        const dispose = disposableLike[Symbol.dispose]
        dispose()
      })
    }
    if (Symbol.asyncDispose in disposableLike) {
      return new AsyncDisposableAction(async () => {
        const dispose = disposableLike[Symbol.asyncDispose]
        await dispose()
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
  }
  // console.warn("Invalid disposable", disposableLike)
  return emptyDisposable
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
export function createDisposableCompat(disposableLike: DisposableLike | Disposable | AsyncDisposable | AbortController): DisposableCompat {
  if (!disposableLike) {
    return emptyDisposable
  }
  if (typeof disposableLike === 'function') {
    return new DisposableAction(disposableLike)
  }
  if (typeof disposableLike === 'object') {
    const hasDispose = "dispose" in disposableLike
    const hasSymbolDispose = Symbol.dispose in disposableLike
    if (hasDispose && hasSymbolDispose) {
      return disposableLike as DisposableCompat
    }
    if (hasDispose) {
      return new DisposableAction(() => disposableLike.dispose())
    }
    if (hasSymbolDispose) {
      return new DisposableAction(() => disposableLike[Symbol.dispose]())
    }
    if (Symbol.asyncDispose in disposableLike) {
      return new DisposableAction(async () => {
        disposableLike[Symbol.asyncDispose]()
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
  }
  // console.warn("Invalid disposable", disposableLike)
  return emptyDisposable
}