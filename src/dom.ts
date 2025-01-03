import { DisposableAction } from "./action"
import type { Disposiq } from "./disposiq"

type EventListener<T extends Event = Event> =
  | ((this: EventTarget, ev: T) => unknown)
  | {
      handleEvent(evt: Event): void
    }

interface EventListenerOptions {
  capture?: boolean
}

interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean
  passive?: boolean
  signal?: AbortSignal
}

interface EventTarget {
  addEventListener<E extends Event>(
    type: string,
    listener: EventListener<E>,
    options?: boolean | AddEventListenerOptions,
  ): void

  removeEventListener<E extends Event>(
    type: string,
    listener: EventListener<E>,
    options?: boolean | EventListenerOptions,
  ): void
}

/**
 * Adds an event listener to the specified target for a given event type.
 * Returns a disposable object to remove the listener when no longer needed.
 *
 * @param {EventTarget} target - The target to which the event listener will be added.
 * @param {string} type - The type of event to listen for (e.g., 'click', 'keydown').
 * @param {EventListener<E>} listener - The callback function to be invoked when the event occurs.
 * @param {boolean | AddEventListenerOptions} [options] - Optional options object or boolean to provide additional configuration for the event listener.
 * @return {Disposiq} A disposable object to remove the event listener.
 */
export function addEventListener<E extends Event>(
  target: EventTarget,
  type: string,
  listener: EventListener<E>,
  options?: boolean | AddEventListenerOptions,
): Disposiq {
  target.addEventListener(type, listener, options)
  return new DisposableAction(() =>
    target.removeEventListener(type, listener, options),
  )
}
