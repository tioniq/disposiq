import {AsyncDisposableCompat, DisposableCompat, DisposableLike, IDisposable} from "./declarations";

/**
 * Check if the value is a disposable object. It means it has a `dispose` method.
 */
export function isDisposable(value: any): value is IDisposable {
  return typeof value === "object" && value !== null && typeof value.dispose === "function"
}

/**
 * Check if the value is a disposable object or a function. It means it has a `dispose` method, or it is a function.
 */
export function isDisposableLike(value: any): value is DisposableLike {
  return typeof value === "function" || (typeof value === "object" && value !== null && typeof value.dispose === "function")
}

/**
 * Check if the value is a disposable object with a `dispose` method and an internal `Symbol.dispose` method.
 */
export function isDisposableCompat(value: any): value is DisposableCompat {
  return typeof value === "object" && value !== null && typeof value.dispose === "function" && typeof value[Symbol.dispose] === "function"
}

/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
export function isAsyncDisposableCompat(value: any): value is AsyncDisposableCompat {
  return typeof value === "object" && value !== null && typeof value.dispose === "function" && typeof value[Symbol.asyncDispose] === "function"
}

/**
 * Check if the value is a disposable object with an internal `Symbol.dispose` method.
 */
export function isSystemDisposable(value: any): value is Disposable {
  return typeof value === "object" && value !== null && typeof value[Symbol.dispose] === "function"
}

/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
export function isSystemAsyncDisposable(value: any): value is AsyncDisposable {
  return typeof value === "object" && value !== null && typeof value[Symbol.asyncDispose] === "function"
}