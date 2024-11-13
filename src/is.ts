import type {
  AsyncDisposableCompat,
  DisposableCompat,
  DisposableLike,
  IDisposable,
} from "./declarations"

/**
 * Check if the value is a disposable object. It means it has a `dispose` method.
 */
export function isDisposable(value: unknown): value is IDisposable {
  return (
    typeof value === "object" &&
    value !== null &&
    // @ts-ignore
    typeof value.dispose === "function"
  )
}

/**
 * Check if the value is a disposable object or a function. It means it has a `dispose` method, or it is a function.
 */
export function isDisposableLike(value: unknown): value is DisposableLike {
  return (
    typeof value === "function" ||
    (typeof value === "object" &&
      value !== null &&
      // @ts-ignore
      typeof value.dispose === "function")
  )
}

/**
 * Check if the value is a disposable object with a `dispose` method and an internal `Symbol.dispose` method.
 */
export function isDisposableCompat(value: unknown): value is DisposableCompat {
  return (
    typeof value === "object" &&
    value !== null &&
    // @ts-ignore
    typeof value.dispose === "function" &&
    // @ts-ignore
    typeof value[Symbol.dispose] === "function"
  )
}

/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
export function isAsyncDisposableCompat(
  value: unknown,
): value is AsyncDisposableCompat {
  return (
    typeof value === "object" &&
    value !== null &&
    // @ts-ignore
    typeof value.dispose === "function" &&
    // @ts-ignore
    typeof value[Symbol.asyncDispose] === "function"
  )
}

/**
 * Check if the value is a disposable object with an internal `Symbol.dispose` method.
 */
export function isSystemDisposable(value: unknown): value is Disposable {
  return (
    typeof value === "object" &&
    value !== null &&
    // @ts-ignore
    typeof value[Symbol.dispose] === "function"
  )
}

/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
export function isSystemAsyncDisposable(
  value: unknown,
): value is AsyncDisposable {
  return (
    typeof value === "object" &&
    value !== null &&
    // @ts-ignore
    typeof value[Symbol.asyncDispose] === "function"
  )
}
