import type { AsyncDisposableLike, DisposableLike } from "./declarations"
import { throwCollected } from "./utils/errors"
import { ObjectPool } from "./utils/object-pool"

const pool = new ObjectPool<(DisposableLike | null | undefined)[]>(10)
const asyncPool = new ObjectPool<
  (DisposableLike | AsyncDisposableLike | null | undefined)[]
>(10)

// Bigger holders are not pooled, so a single large disposal does not pin a large array forever
const maxPooledHolderLength = 1024

/**
 * Dispose a disposable object or call a dispose function
 * @param disposable a disposable object or a dispose function. Can be null or undefined - no-op
 */
export function justDispose(disposable: DisposableLike | null | undefined) {
  if (!disposable) {
    return
  }
  if (typeof disposable === "function") {
    disposable()
  } else {
    disposable.dispose()
  }
}


/**
 * Dispose a disposable object or call a dispose function
 * @param disposable a disposable object or a dispose function. Can be null or undefined - no-op
 * @param onError a callback to handle errors
 */
export function justDisposeSafe(disposable: DisposableLike | null | undefined, onError?: (error: unknown) => void) {
  if (!disposable) {
    return
  }
  try {
    if (typeof disposable === "function") {
      disposable()
    } else {
      disposable.dispose()
    }
  } catch (e) {
    onError?.(e)
  }
}

/**
 * Dispose an async disposable object or call an async dispose function
 * @param disposable an async disposable object or an async dispose function. Can be null or undefined - no-op
 * @returns a promise that resolves when the disposal is complete
 */
export async function justDisposeAsync(
  disposable: DisposableLike | AsyncDisposableLike | null | undefined,
): Promise<void> {
  if (!disposable) {
    return
  }
  if (typeof disposable === "function") {
    await disposable()
  } else {
    await disposable.dispose()
  }
}

/**
 * Dispose the items of the array, continuing past the ones that throw. Without `length`, the length is re-read on
 * every step
 * @returns the collected errors, or undefined if there were none
 * @internal
 */
function disposeRange(
  disposables: (DisposableLike | null | undefined)[],
  length?: number,
): unknown[] | undefined {
  let errors: unknown[] | undefined
  for (let i = 0; i < (length ?? disposables.length); ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    try {
      if (typeof disposable === "function") {
        disposable()
      } else {
        disposable.dispose()
      }
    } catch (e) {
      if (errors === undefined) {
        errors = [e]
      } else {
        errors.push(e)
      }
    }
  }
  return errors
}

/**
 * Dispose the items of the array one after another, continuing past the ones that reject. Without `length`, the
 * length is re-read on every step
 * @returns the collected errors, or undefined if there were none
 * @internal
 */
async function disposeRangeAsync(
  disposables: (DisposableLike | AsyncDisposableLike | null | undefined)[],
  length?: number,
): Promise<unknown[] | undefined> {
  let errors: unknown[] | undefined
  for (let i = 0; i < (length ?? disposables.length); ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    try {
      if (typeof disposable === "function") {
        await disposable()
      } else {
        await disposable.dispose()
      }
    } catch (e) {
      if (errors === undefined) {
        errors = [e]
      } else {
        errors.push(e)
      }
    }
  }
  return errors
}

/**
 * Dispose all disposables in the array. Will check each item for null or undefined. Every item is disposed even if
 * some of them throw; then the error is rethrown (several errors are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
export function justDisposeAll(
  disposables: (DisposableLike | null | undefined)[],
) {
  throwCollected(disposeRange(disposables))
}

/**
 * Dispose all async disposables in the array. Will check each item for null or undefined. Every item is disposed even
 * if some of them reject; then the promise rejects (several errors are wrapped in an AggregateError)
 * @param disposables an array of disposables
 * @returns a promise that resolves when all disposals are complete
 */
export async function justDisposeAllAsync(
  disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
): Promise<void> {
  throwCollected(await disposeRangeAsync(disposables))
}

/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify.
 * Every item is disposed even if some of them throw; then the error is rethrown (several errors are wrapped in an
 * AggregateError)
 * @param disposables an array of disposables
 */
export function disposeAll(disposables: (DisposableLike | null | undefined)[]) {
  const size = disposables.length
  if (size === 0) {
    return
  }
  let holder = pool.lift()
  if (holder === null) {
    holder = new Array<DisposableLike | null | undefined>(size)
  } else {
    if (holder.length < size) {
      holder.length = size
    }
  }
  for (let i = 0; i < size; i++) {
    holder[i] = disposables[i]
  }
  disposables.length = 0
  let errors: unknown[] | undefined
  try {
    errors = disposeRange(holder, size)
  } finally {
    // biome-ignore lint/style/noNonNullAssertion: need to fill the array with undefined
    holder.fill(undefined!, 0, size)
    if (holder.length <= maxPooledHolderLength) {
      if (pool.full) {
        pool.size *= 2
      }
      pool.throw(holder)
    }
  }
  throwCollected(errors)
}

/**
 * Dispose all async disposables in the array safely. During the disposal process, the array is safe to modify.
 * Every item is disposed even if some of them reject; then the promise rejects (several errors are wrapped in an
 * AggregateError)
 * @param disposables an array of disposables
 */
export async function disposeAllAsync(
  disposables: (DisposableLike | AsyncDisposableLike | null | undefined)[],
): Promise<void> {
  const size = disposables.length
  if (size === 0) {
    return
  }
  let holder = asyncPool.lift()
  if (holder === null) {
    holder = new Array<DisposableLike | AsyncDisposableLike>(size)
  } else {
    if (holder.length < size) {
      holder.length = size
    }
  }
  for (let i = 0; i < size; i++) {
    holder[i] = disposables[i]
  }
  disposables.length = 0
  let errors: unknown[] | undefined
  try {
    errors = await disposeRangeAsync(holder, size)
  } finally {
    // biome-ignore lint/style/noNonNullAssertion: need to fill the array with undefined
    holder.fill(undefined!, 0, size)
    if (holder.length <= maxPooledHolderLength) {
      if (asyncPool.full) {
        asyncPool.size *= 2
      }
      asyncPool.throw(holder)
    }
  }
  throwCollected(errors)
}

/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify.
 * Every item is disposed even if some of them throw; the array is cleared, then the error is rethrown (several errors
 * are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
export function disposeAllUnsafe(
  disposables: (DisposableLike | null | undefined)[],
) {
  let errors: unknown[] | undefined
  try {
    errors = disposeRange(disposables)
  } finally {
    disposables.length = 0
  }
  throwCollected(errors)
}

/**
 * Dispose all async disposables in the array unsafely. During the disposal process, the array is not safe to modify.
 * Every item is disposed even if some of them reject; the array is cleared, then the promise rejects (several errors
 * are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
export async function disposeAllUnsafeAsync(
  disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
) {
  let errors: unknown[] | undefined
  try {
    errors = await disposeRangeAsync(disposables)
  } finally {
    disposables.length = 0
  }
  throwCollected(errors)
}

/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
export function disposeAllSafely(
  disposables: (DisposableLike | null | undefined)[],
  onErrorCallback?: (error: unknown) => void,
) {
  if (disposables.length === 0) {
    return
  }
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    try {
      if (typeof disposable === "function") {
        disposable()
      } else {
        disposable.dispose()
      }
    } catch (e) {
      onErrorCallback?.(e)
    }
  }
  disposables.length = 0
}

/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
export async function disposeAllSafelyAsync(
  disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[],
  onErrorCallback?: (error: unknown) => void,
) {
  if (disposables.length === 0) {
    return
  }
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    try {
      if (typeof disposable === "function") {
        await disposable()
      } else {
        await disposable.dispose()
      }
    } catch (e) {
      onErrorCallback?.(e)
    }
  }
  disposables.length = 0
}
