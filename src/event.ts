import type { DisposableAwareCompat } from "./declarations"
import { DisposableAction } from "./action"

interface EventEmitterLike {
  on<K extends string | symbol>(
    event: K,
    listener: (...args: unknown[]) => void,
  ): unknown

  off<K extends string | symbol>(
    event: K,
    listener: (...args: unknown[]) => void,
  ): unknown

  once?<K extends string | symbol>(
    event: K,
    listener: (...args: unknown[]) => void,
  ): unknown
}

/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener
 * @returns a disposable object
 * @remarks All my trials to infer event name list and listener arguments failed. I had to use (string | symbol) for
 * event name and any[] for listener args. I'm not sure if it's possible to infer them for now.
 * If you can do it, please let me know and let's talk about it))
 */
export function disposableFromEvent<K extends string | symbol>(
  emitter: EventEmitterLike,
  event: K,
  listener: (...args: unknown[]) => void,
): DisposableAwareCompat {
  emitter.on(event, listener)
  return new DisposableAction(() => {
    emitter.off(event, listener)
  })
}

/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * The listener will only be called once.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener
 * @returns a disposable object
 */
export function disposableFromEventOnce<K extends string | symbol>(
  emitter: EventEmitterLike,
  event: K,
  listener: (...args: unknown[]) => void,
): DisposableAwareCompat {
  emitter.once(event, listener)
  return new DisposableAction(() => {
    emitter.off(event, listener)
  })
}
