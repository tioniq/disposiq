import type { DisposableAwareCompat } from "./declarations"
import { DisposableAction } from "./action"
import type { Disposiq } from "./disposiq"

/**
 * Any function can be a listener; the functions below keep the listener's own type
 */
type EventListenerLike = (...args: never[]) => unknown

interface EventEmitterLike<K extends string | symbol, L extends EventListenerLike> {
  on(event: K, listener: L): unknown

  off(event: K, listener: L): unknown

  once?(event: K, listener: L): unknown
}

/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener. Its parameter types are kept, e.g. `(code: number) => void`
 * @returns a disposable object
 * @remarks Event names are not inferred from the emitter's type: any string or symbol is accepted
 */
export function disposableFromEvent<
  K extends string | symbol,
  L extends EventListenerLike = (...args: unknown[]) => void,
>(
  emitter: EventEmitterLike<K, L>,
  event: K,
  listener: L,
): Disposiq & DisposableAwareCompat {
  emitter.on(event, listener)
  return new DisposableAction(() => {
    emitter.off(event, listener)
  })
}

/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * The listener will only be called once. An emitter without `once` is supported: the listener is added with `on` and
 * removed before its first call.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener. Its parameter types are kept, e.g. `(code: number) => void`
 * @returns a disposable object
 */
export function disposableFromEventOnce<
  K extends string | symbol,
  L extends EventListenerLike = (...args: unknown[]) => void,
>(
  emitter: EventEmitterLike<K, L>,
  event: K,
  listener: L,
): Disposiq & DisposableAwareCompat {
  if (typeof emitter.once === "function") {
    emitter.once(event, listener)
    return new DisposableAction(() => {
      emitter.off(event, listener)
    })
  }
  const wrapper = ((...args: Parameters<L>) => {
    emitter.off(event, wrapper)
    return listener(...args)
  }) as L
  emitter.on(event, wrapper)
  return new DisposableAction(() => {
    emitter.off(event, wrapper)
  })
}
