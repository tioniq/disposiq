import type { IAsyncDisposable, IDisposable } from "./declarations"

/**
 * Executes a provided action function using a resource that implements the IDisposable interface.
 * Ensures that the resource is properly disposed of after the action completes or if an exception occurs.
 * @param resource The disposable resource to be used in the action.
 * @param action A callback function that performs an operation using the resource.
 * @return Returns the result of the action performed.
 */
export function using<T extends IDisposable, R>(
  resource: T,
  action: (resource: T) => R,
): R

/**
 * Executes a provided action function using a resource that implements the IDisposable interface.
 * Ensures that the resource is properly disposed of after the action completes or if an exception occurs.
 * @param resource The disposable resource to be used in the action.
 * @param action A callback function that performs an operation using the resource.
 * @return Returns the result of the action performed.
 */
export function using<T extends IDisposable | IAsyncDisposable, R>(
  resource: T,
  action: (resource: T) => Promise<R>,
): Promise<R>

/**
 * Executes an action with a disposable resource and disposes the resource when the action is done.
 * @param resource the disposable resource
 * @param action the action to execute
 */
export function using<T extends IDisposable | IAsyncDisposable, R>(
  resource: T,
  action: (resource: T) => R | Promise<R>,
): R | Promise<R> {
  let result: R | Promise<R>
  try {
    result = action(resource)
  } catch (e) {
    return runDispose(resource, () => {
      throw e
    })
  }
  if (result instanceof Promise) {
    return result
      .then((r) => runDispose(resource, () => r))
      .catch((e) =>
        runDispose(resource, () => {
          throw e
        }),
      )
  }
  return runDispose(resource, () => result)
}

function runDispose<R>(
  disposable: IDisposable | IAsyncDisposable,
  action: () => R,
): R | Promise<R> {
  const disposeResult = disposable.dispose()
  if (disposeResult instanceof Promise) {
    return disposeResult.then(action)
  }
  return action()
}
