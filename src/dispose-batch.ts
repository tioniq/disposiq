import {DisposableLike} from "./declarations"
import {ObjectPool} from "./utils/object-pool"

const pool = new ObjectPool<DisposableLike[]>(10)

/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
export function disposeAll(disposables: DisposableLike[]) {
  let size = disposables.length
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
  holder.fill(undefined!, 0, size)
  if (pool.full) {
    pool.size *= 2
  }
  pool.throw(holder)
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