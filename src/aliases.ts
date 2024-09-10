import {DisposableStore} from "./store";
import {DisposableContainer} from "./container";
import {BoolDisposable} from "./bool";
import {disposeAll} from "./dispose-batch";
import {disposableFromEvent, disposableFromEventOnce} from "./event";
import {createDisposable, createDisposableCompat} from "./create";

export const CompositeDisposable = DisposableStore
export const SerialDisposable = DisposableContainer
export const BooleanDisposable = BoolDisposable
export const disposeAllSafe = disposeAll
export const on = disposableFromEvent
export const once = disposableFromEventOnce
export const toDisposable = createDisposable
export const toDisposableCompat = createDisposableCompat
