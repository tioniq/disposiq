import {DisposableStore} from "./store";
import {DisposableContainer} from "./container";
import {BoolDisposable} from "./bool";
import {disposeAll} from "./dispose-batch";
import {disposableFromEvent, disposableFromEventOnce} from "./event";
import {createDisposable, createDisposableCompat, createDisposiq} from "./create";
import {AsyncDisposiq, Disposiq} from "./disposiq";
import {DisposableMapStore} from "./map-store";

export {
  BoolDisposable as BooleanDisposable,
  DisposableContainer as SerialDisposable,
  DisposableStore as CompositeDisposable,
  Disposiq as BaseDisposable,
  AsyncDisposiq as BaseAsyncDisposable,
  DisposableMapStore as DisposableDictionary,
  disposeAll as disposeAllSafe,
  disposableFromEvent as on,
  disposableFromEventOnce as once,
  createDisposable as toDisposable,
  createDisposableCompat as toDisposableCompat,
  createDisposiq as toDisposiq,
}
