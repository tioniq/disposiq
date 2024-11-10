import { DisposableAction } from "./action";
import { Disposiq } from "./disposiq";

type EventListener<T extends Event = Event> = ((this: EventTarget, ev: T) => any) | {
  handleEvent(evt: Event): void
}

interface EventListenerOptions {
  capture?: boolean;
}

interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

interface EventTarget {
  addEventListener<E extends Event>(type: string, listener: EventListener<E>, options?: boolean | AddEventListenerOptions): void

  removeEventListener<E extends Event>(type: string, listener: EventListener<E>, options?: boolean | EventListenerOptions): void
}

export function addEventListener<E extends Event>(target: EventTarget, type: string, listener: EventListener<E>, options?: boolean | AddEventListenerOptions): Disposiq {
  target.addEventListener(type, listener, options)
  return new DisposableAction(() => target.removeEventListener(type, listener, options))
}