/**
 * @internal
 */
export const resolvedPromise: Promise<void> = Promise.resolve()

/**
 * Returns a promise that settles like the given one, after the callback has run
 * @internal
 */
export function onSettled(
  promise: Promise<void>,
  callback: () => void,
): Promise<void> {
  return promise.then(callback, (e: unknown) => {
    callback()
    throw e
  })
}

/**
 * Invoke the action and always return a promise, turning a synchronous throw into a rejection
 * @internal
 */
export async function invokeAsync(
  action: () => Promise<void> | void,
): Promise<void> {
  await action()
}
