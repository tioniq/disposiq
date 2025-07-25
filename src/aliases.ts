import { BoolDisposable } from "./bool"
import { disposableFromCancellationToken } from "./cancellation"
import { DisposableContainer } from "./container"
import {
  createDisposable,
  createDisposableCompat,
  createDisposiq,
} from "./create"
import { disposeAll } from "./dispose-batch"
import { AsyncDisposiq, Disposiq } from "./disposiq"
import { disposableFromEvent, disposableFromEventOnce } from "./event"
import { DisposableMapStore } from "./map-store"
import { SafeActionDisposable, SafeAsyncActionDisposable } from "./safe"
import { DisposableStore } from "./store"
import { AsyncDisposableStore } from "./store-async"

export {
  BoolDisposable as BooleanDisposable,
  DisposableContainer as SerialDisposable,
  DisposableStore as CompositeDisposable,
  AsyncDisposableStore as CompositeAsyncDisposable,
  Disposiq as BaseDisposable,
  AsyncDisposiq as BaseAsyncDisposable,
  DisposableMapStore as DisposableDictionary,
  SafeActionDisposable as ActionSafeDisposable,
  SafeAsyncActionDisposable as AsyncActionSafeDisposable,
  disposeAll as disposeAllSafe,
  disposableFromEvent as on,
  disposableFromEventOnce as once,
  createDisposable as toDisposable,
  createDisposableCompat as toDisposableCompat,
  createDisposiq as toDisposiq,
  disposableFromCancellationToken as createCancellationTokenDisposable
}
