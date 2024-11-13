import type { AsyncDisposableLike, DisposableLike } from "./declarations"
import { ObjectPool } from "./utils/object-pool"

const pool = new ObjectPool<DisposableLike[]>(10)
const asyncPool = new ObjectPool<(DisposableLike | AsyncDisposableLike)[]>(10)

export function justDispose(disposable: DisposableLike) {
  if (!disposable) {
    return
  }
  if (typeof disposable === "function") {
    disposable()
  } else {
    disposable.dispose()
  }
}

export async function justDisposeAsync(
  disposable: DisposableLike | AsyncDisposableLike,
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

export function justDisposeAll(disposables: DisposableLike[]) {
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    if (typeof disposable === "function") {
      disposable()
    } else {
      disposable.dispose()
    }
  }
}

export async function justDisposeAllAsync(
  disposables: (AsyncDisposableLike | DisposableLike)[],
): Promise<void> {
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    if (typeof disposable === "function") {
      await disposable()
    } else {
      await disposable.dispose()
    }
  }
}

/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
export function disposeAll(disposables: DisposableLike[]) {
  const size = disposables.length
  if (size === 0) {
    return
  }
  let holder = pool.lift()
  if (holder === null) {
    holder = new Array<DisposableLike>(size)
  } else {
    if (holder.length < size) {
      holder.length = size
    }
  }
  for (let i = 0; i < size; i++) {
    holder[i] = disposables[i]
  }
  disposables.length = 0
  try {
    for (let i = 0; i < size; ++i) {
      const disposable = holder[i]
      if (!disposable) {
        continue
      }
      if (typeof disposable === "function") {
        disposable()
      } else {
        disposable.dispose()
      }
    }
  } finally {
    // biome-ignore lint/style/noNonNullAssertion: need to fill the array with undefined
    holder.fill(undefined!, 0, size)
    if (pool.full) {
      pool.size *= 2
    }
    pool.throw(holder)
  }
}

/**
 * Dispose all async disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
export async function disposeAllAsync(
  disposables: (DisposableLike | AsyncDisposableLike)[],
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
  try {
    for (let i = 0; i < size; ++i) {
      const disposable = holder[i]
      if (!disposable) {
        continue
      }
      if (typeof disposable === "function") {
        await disposable()
      } else {
        await disposable.dispose()
      }
    }
  } finally {
    // biome-ignore lint/style/noNonNullAssertion: need to fill the array with undefined
    holder.fill(undefined!, 0, size)
    if (asyncPool.full) {
      asyncPool.size *= 2
    }
    asyncPool.throw(holder)
  }
}

/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 */
export function disposeAllUnsafe(disposables: DisposableLike[]) {
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    if (typeof disposable === "function") {
      disposable()
    } else {
      disposable.dispose()
    }
  }
  disposables.length = 0
}

/**
 * Dispose all async disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 */
export async function disposeAllUnsafeAsync(
  disposables: (AsyncDisposableLike | DisposableLike)[],
) {
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i]
    if (!disposable) {
      continue
    }
    if (typeof disposable === "function") {
      await disposable()
    } else {
      await disposable.dispose()
    }
  }
  disposables.length = 0
}

/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
export function disposeAllSafely(
  disposables: DisposableLike[],
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
  disposables: (AsyncDisposableLike | DisposableLike)[],
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
