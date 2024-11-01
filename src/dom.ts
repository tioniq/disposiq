import { DisposableAction } from "./action";
import { Disposiq } from "./disposiq";

type EventListener = ((this: EventTarget, ev: Event) => any) | {
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
  addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void

  removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void
}

export function addEventListener(target: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): Disposiq {
  target.addEventListener(type, listener, options)
  return new DisposableAction(() => target.removeEventListener(type, listener, options))
}