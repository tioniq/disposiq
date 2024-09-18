import {IAsyncDisposable, IDisposable} from "./declarations";

export function using<T extends IDisposable, R>(resource: T, action: (resource: T) => R): R

export function using<T extends IDisposable | IAsyncDisposable, R>(resource: T, action: (resource: T) => Promise<R>): Promise<R>

export function using<T extends IDisposable | IAsyncDisposable, R>(resource: T, action: (resource: T) => R | Promise<R>): R | Promise<R> {
  let result: R | Promise<R>
  try {
    result = action(resource)
  } catch (e) {
    return runDispose(resource, () => {
      throw e
    })
  }
  if (result instanceof Promise) {
    return result.then(r => runDispose(resource, () => r))
      .catch(e => runDispose(resource, () => {
        throw e
      }))
  }
  return runDispose(resource, () => result)
}

function runDispose<R>(disposable: IDisposable | IAsyncDisposable, action: () => R): R | Promise<R> {
  const disposeResult = disposable.dispose()
  if (disposeResult instanceof Promise) {
    return disposeResult.then(action)
  }
  return action()
}