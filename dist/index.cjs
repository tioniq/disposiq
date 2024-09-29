"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AbortDisposable: () => AbortDisposable,
  AsyncDisposableAction: () => AsyncDisposableAction,
  AsyncDisposiq: () => AsyncDisposiq,
  BaseAsyncDisposable: () => AsyncDisposiq,
  BaseDisposable: () => Disposiq,
  BoolDisposable: () => BoolDisposable,
  BooleanDisposable: () => BoolDisposable,
  CompositeDisposable: () => DisposableStore,
  Disposable: () => Disposable,
  DisposableAction: () => DisposableAction,
  DisposableContainer: () => DisposableContainer,
  DisposableStore: () => DisposableStore,
  Disposiq: () => Disposiq,
  ObjectDisposedException: () => ObjectDisposedException,
  SafeActionDisposable: () => SafeActionDisposable,
  SafeAsyncActionDisposable: () => SafeAsyncActionDisposable,
  SerialDisposable: () => DisposableContainer,
  createDisposable: () => createDisposable,
  createDisposableCompat: () => createDisposableCompat,
  createDisposiq: () => createDisposiq,
  disposableFromEvent: () => disposableFromEvent,
  disposableFromEventOnce: () => disposableFromEventOnce,
  disposeAll: () => disposeAll,
  disposeAllSafe: () => disposeAll,
  disposeAllUnsafe: () => disposeAllUnsafe,
  emptyDisposable: () => emptyDisposable,
  isAsyncDisposableCompat: () => isAsyncDisposableCompat,
  isDisposable: () => isDisposable,
  isDisposableCompat: () => isDisposableCompat,
  isDisposableLike: () => isDisposableLike,
  isSystemAsyncDisposable: () => isSystemAsyncDisposable,
  isSystemDisposable: () => isSystemDisposable,
  on: () => disposableFromEvent,
  once: () => disposableFromEventOnce,
  safeDisposableExceptionHandlerManager: () => safeDisposableExceptionHandlerManager,
  toDisposable: () => createDisposable,
  toDisposableCompat: () => createDisposableCompat,
  toDisposiq: () => createDisposiq,
  using: () => using
});
module.exports = __toCommonJS(src_exports);

// src/init.ts
if (!("dispose" in Symbol)) {
  const disposeSymbol = Symbol("Symbol.dispose");
  Symbol.dispose = disposeSymbol;
}
if (!("asyncDispose" in Symbol)) {
  const asyncDisposeSymbol = Symbol("Symbol.asyncDispose");
  Symbol.asyncDispose = asyncDisposeSymbol;
}

// src/disposiq.ts
var Disposiq = class {
  /**
   * Support for the internal Disposable API
   */
  [Symbol.dispose]() {
    this.dispose();
  }
};
var AsyncDisposiq = class extends Disposiq {
  /**
   * Support for the internal Disposable API
   */
  [Symbol.asyncDispose]() {
    return this.dispose();
  }
};

// src/abort.ts
var AbortDisposable = class extends Disposiq {
  constructor(controller) {
    super();
    this._controller = controller;
  }
  /**
   * Returns true if the signal is aborted
   */
  get disposed() {
    return this._controller.signal.aborted;
  }
  /**
   * Returns the signal of the AbortController
   */
  get signal() {
    return this._controller.signal;
  }
  /**
   * Abort the signal
   */
  dispose() {
    this._controller.abort();
  }
};

// src/utils/noop.ts
var noop = Object.freeze(() => {
});
var noopAsync = Object.freeze(() => Promise.resolve());

// src/action.ts
var DisposableAction = class extends Disposiq {
  constructor(action) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._action = typeof action === "function" ? action : noop;
  }
  /**
   * Returns true if the action has been disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the action. If the action has already been disposed, this is a
   * no-op.
   * If the action has not been disposed, the action is invoked and the action
   * is marked as disposed.
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._action();
  }
};
var AsyncDisposableAction = class extends AsyncDisposiq {
  constructor(action) {
    super();
    this._disposed = false;
    this._action = typeof action === "function" ? action : noopAsync;
  }
  /**
   * Returns true if the action has been disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the action. If the action has already been disposed, this is a
   * no-op.
   * If the action has not been disposed, the action is invoked and the action
   * is marked as disposed.
   */
  dispose() {
    return __async(this, null, function* () {
      if (this._disposed) {
        return;
      }
      this._disposed = true;
      yield this._action();
    });
  }
};

// src/utils/queue.ts
var Node = class {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
};
var Queue = class {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  enqueue(value) {
    const node = new Node(value);
    if (this.head) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = node;
    }
    this.length++;
  }
  dequeue() {
    const current = this.head;
    if (current === null) {
      return null;
    }
    this.head = current.next;
    this.length--;
    return current.value;
  }
  isEmpty() {
    return this.length === 0;
  }
  getHead() {
    var _a, _b;
    return (_b = (_a = this.head) == null ? void 0 : _a.value) != null ? _b : null;
  }
  getLength() {
    return this.length;
  }
  forEach(consumer) {
    let current = this.head;
    while (current !== null) {
      consumer(current.value);
      current = current.next;
    }
  }
  toArray() {
    const result = [];
    let current = this.head;
    while (current !== null) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
};

// src/utils/object-pool.ts
var ObjectPool = class {
  constructor(poolSize) {
    this._scrap = new Queue();
    this._size = poolSize;
  }
  get size() {
    return this._size;
  }
  set size(value) {
    this._size = value;
  }
  get all() {
    return this._scrap.toArray();
  }
  get full() {
    return this._scrap.length === this._size;
  }
  lift() {
    return this._scrap.length > 0 ? this._scrap.dequeue() : null;
  }
  throw(item) {
    if (this._scrap.length < this._size) {
      this._scrap.enqueue(item);
      return null;
    }
    if (this._size === 0) {
      return item;
    }
    const recycled = this._scrap.dequeue();
    this._scrap.enqueue(item);
    return recycled;
  }
  clear() {
    this._scrap.clear();
  }
};

// src/dispose-batch.ts
var pool = new ObjectPool(10);
function disposeAll(disposables) {
  let size = disposables.length;
  if (size === 0) {
    return;
  }
  let holder = pool.lift();
  if (holder === null) {
    holder = new Array(size);
  } else {
    if (holder.length < size) {
      holder.length = size;
    }
  }
  for (let i = 0; i < size; i++) {
    holder[i] = disposables[i];
  }
  disposables.length = 0;
  for (let i = 0; i < size; ++i) {
    const disposable = holder[i];
    if (!disposable) {
      continue;
    }
    if (typeof disposable === "function") {
      disposable();
    } else {
      disposable.dispose();
    }
  }
  holder.fill(void 0, 0, size);
  if (pool.full) {
    pool.size *= 2;
  }
  pool.throw(holder);
}
function disposeAllUnsafe(disposables) {
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i];
    if (!disposable) {
      continue;
    }
    if (typeof disposable === "function") {
      disposable();
    } else {
      disposable.dispose();
    }
  }
  disposables.length = 0;
}

// src/exception.ts
var ObjectDisposedException = class extends Error {
  constructor(message) {
    super(message || "Object disposed");
  }
};

// src/store.ts
var DisposableStore = class _DisposableStore extends Disposiq {
  constructor() {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._disposables = new Array();
  }
  /**
   * Returns true if the object has been disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   */
  add(...disposables) {
    this.addAll(disposables);
  }
  /**
   * Adds disposables to the container. If the container has already been disposed, the disposables will be disposed.
   * @param disposables Disposables to add.
   */
  addAll(disposables) {
    if (!disposables || disposables.length === 0) {
      return;
    }
    if (this._disposed) {
      for (const disposable of disposables) {
        if (!disposable) {
          continue;
        }
        if (typeof disposable === "function") {
          disposable();
        } else {
          disposable.dispose();
        }
      }
      return;
    }
    for (let i = 0; i < disposables.length; i++) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      this._disposables.push(typeof disposable === "function" ? new DisposableAction(disposable) : disposable);
    }
  }
  /**
   * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
   * @param disposable a disposable to add
   * @returns the disposable object
   */
  addOne(disposable) {
    if (!disposable) {
      return;
    }
    if (this._disposed) {
      if (typeof disposable === "function") {
        disposable();
      } else {
        disposable.dispose();
      }
      return;
    }
    if (typeof disposable === "function") {
      disposable = new DisposableAction(disposable);
    }
    this._disposables.push(disposable);
  }
  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will be disposed.
   * @param disposable a disposable to remove
   * @returns true if the disposable was found and removed
   */
  remove(disposable) {
    const index = this._disposables.indexOf(disposable);
    if (index === -1) {
      return false;
    }
    this._disposables.splice(index, 1);
    return true;
  }
  /**
   * @internal
   */
  addTimeout(callbackOrTimeout, timeout) {
    if (typeof callbackOrTimeout === "function") {
      const handle = setTimeout(callbackOrTimeout, timeout);
      this.add(() => clearTimeout(handle));
      return;
    }
    this.add(() => clearTimeout(callbackOrTimeout));
  }
  /**
   * @internal
   */
  addInterval(callbackOrInterval, interval) {
    if (typeof callbackOrInterval === "function") {
      const handle = setInterval(callbackOrInterval, interval);
      this.add(() => clearInterval(handle));
      return;
    }
    this.add(() => clearInterval(callbackOrInterval));
  }
  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message) {
    if (this._disposed) {
      throw new ObjectDisposedException(message);
    }
  }
  /**
   * Dispose the store. If the store has already been disposed, this is a no-op.
   * If the store has not been disposed, all disposables added to the store will be disposed.
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    disposeAllUnsafe(this._disposables);
  }
  /**
   * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
   * store. The store can continue to be used after this method is called. This method is useful when the store is
   * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
   * this method will safely add the disposable to the store without disposing it immediately.
   */
  disposeCurrent() {
    disposeAll(this._disposables);
  }
  static from(disposables, mapper) {
    if (typeof mapper === "function") {
      const store2 = new _DisposableStore();
      store2.addAll(disposables.map(mapper));
      return store2;
    }
    const store = new _DisposableStore();
    store.addAll(disposables);
    return store;
  }
};

// src/container.ts
var DisposableContainer = class extends Disposiq {
  constructor(disposable = void 0) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._disposable = disposable;
  }
  /**
   * Returns true if the container is disposed
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Returns the current disposable object
   */
  get disposable() {
    return this._disposable;
  }
  /**
   * Set the new disposable and dispose the old one
   * @param disposable a new disposable to set
   */
  set(disposable) {
    if (this._disposed) {
      disposable.dispose();
      return;
    }
    const oldDisposable = this._disposable;
    this._disposable = disposable;
    if (oldDisposable != void 0) {
      oldDisposable.dispose();
    }
  }
  /**
   * Replace the disposable with a new one. Does not dispose the old one
   * @param disposable a new disposable to replace the old one
   */
  replace(disposable) {
    if (this._disposed) {
      disposable.dispose();
      return;
    }
    this._disposable = disposable;
  }
  /**
   * Dispose only the current disposable object without affecting the container's state.
   */
  disposeCurrent() {
    const disposable = this._disposable;
    if (disposable != void 0) {
      this._disposable = void 0;
      disposable.dispose();
    }
  }
  /**
   * Dispose the disposable object. All next set or replace calls will dispose the new disposable object
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    if (this._disposable == void 0) {
      return;
    }
    this._disposable.dispose();
    this._disposable = void 0;
  }
};

// src/bool.ts
var BoolDisposable = class extends Disposiq {
  constructor(disposed = false) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._disposed = disposed;
  }
  /**
   * Returns true if the disposable is disposed
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the object
   */
  dispose() {
    this._disposed = true;
  }
};

// src/event.ts
function disposableFromEvent(emitter, event, listener) {
  emitter.on(event, listener);
  return new DisposableAction(() => {
    emitter.off(event, listener);
  });
}
function disposableFromEventOnce(emitter, event, listener) {
  emitter.once(event, listener);
  return new DisposableAction(() => {
    emitter.off(event, listener);
  });
}

// src/empty.ts
var emptyPromise = Promise.resolve();
var EmptyDisposable = class extends AsyncDisposiq {
  dispose() {
    return emptyPromise;
  }
  [Symbol.dispose]() {
  }
  [Symbol.asyncDispose]() {
    return emptyPromise;
  }
};
var emptyDisposableImpl = new EmptyDisposable();
var emptyDisposable = Object.freeze(emptyDisposableImpl);

// src/create.ts
function createDisposable(disposableLike) {
  if (!disposableLike) {
    return emptyDisposable;
  }
  if (typeof disposableLike === "function") {
    return new DisposableAction(disposableLike);
  }
  if (typeof disposableLike !== "object") {
    return emptyDisposable;
  }
  if ("dispose" in disposableLike) {
    return disposableLike;
  }
  if (Symbol.dispose in disposableLike) {
    return new DisposableAction(() => {
      disposableLike[Symbol.dispose]();
    });
  }
  if (Symbol.asyncDispose in disposableLike) {
    return new AsyncDisposableAction(() => __async(this, null, function* () {
      yield disposableLike[Symbol.asyncDispose]();
    }));
  }
  if ("unref" in disposableLike) {
    return new DisposableAction(() => disposableLike.unref());
  }
  if (disposableLike instanceof AbortController) {
    return new AbortDisposable(disposableLike);
  }
  return emptyDisposable;
}
function createDisposableCompat(disposableLike) {
  if (!disposableLike) {
    return emptyDisposable;
  }
  if (typeof disposableLike === "function") {
    return new DisposableAction(disposableLike);
  }
  if (typeof disposableLike !== "object") {
    return emptyDisposable;
  }
  const hasDispose = "dispose" in disposableLike;
  const hasSymbolDispose = Symbol.dispose in disposableLike;
  if (hasDispose && hasSymbolDispose) {
    return disposableLike;
  }
  if (hasDispose) {
    return new DisposableAction(() => disposableLike.dispose());
  }
  if (hasSymbolDispose) {
    return new DisposableAction(() => disposableLike[Symbol.dispose]());
  }
  if (Symbol.asyncDispose in disposableLike) {
    return new DisposableAction(() => __async(this, null, function* () {
      disposableLike[Symbol.asyncDispose]();
    }));
  }
  if ("unref" in disposableLike) {
    return new DisposableAction(() => disposableLike.unref());
  }
  if (disposableLike instanceof AbortController) {
    return new AbortDisposable(disposableLike);
  }
  return emptyDisposable;
}
function createDisposiq(disposableLike) {
  if (!disposableLike) {
    return emptyDisposable;
  }
  if (disposableLike instanceof Disposiq) {
    return disposableLike;
  }
  if (typeof disposableLike === "function") {
    return new DisposableAction(disposableLike);
  }
  if (typeof disposableLike !== "object") {
    return emptyDisposable;
  }
  const hasDispose = "dispose" in disposableLike && typeof disposableLike.dispose === "function";
  const hasSymbolDispose = Symbol.dispose in disposableLike;
  if (hasDispose && hasSymbolDispose) {
    return new class extends Disposiq {
      dispose() {
        disposableLike.dispose();
      }
      [Symbol.dispose]() {
        disposableLike[Symbol.dispose]();
      }
    }();
  }
  if (hasDispose) {
    return new DisposableAction(() => disposableLike.dispose());
  }
  if (hasSymbolDispose) {
    return new DisposableAction(() => disposableLike[Symbol.dispose]());
  }
  if (Symbol.asyncDispose in disposableLike) {
    return new AsyncDisposableAction(() => __async(this, null, function* () {
      yield disposableLike[Symbol.asyncDispose]();
    }));
  }
  if ("unref" in disposableLike) {
    return new DisposableAction(() => disposableLike.unref());
  }
  if (disposableLike instanceof AbortController) {
    return new AbortDisposable(disposableLike);
  }
  return emptyDisposable;
}

// src/disposable.ts
var Disposable = class extends Disposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._store = new DisposableStore();
  }
  /**
   * Returns true if the object has been disposed.
   */
  get disposed() {
    return this._store.disposed;
  }
  /**
   * Register a disposable object. The object will be disposed when the current object is disposed.
   * @param t a disposable object
   * @protected inherited classes should use this method to register disposables
   * @returns the disposable object
   */
  register(t) {
    this._store.addOne(t);
    return t;
  }
  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   * @protected inherited classes can use this method to throw an exception if the object has been disposed
   */
  throwIfDisposed(message) {
    this._store.throwIfDisposed(message);
  }
  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposable a disposable to add
   */
  addDisposable(disposable) {
    this._store.addOne(disposable);
  }
  /**
   * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables disposables to add
   */
  addDisposables(...disposables) {
    this._store.addAll(disposables);
  }
  /**
   * Dispose the object. If the object has already been disposed, this is a no-op.
   * If the object has not been disposed, all disposables added to the object will be disposed.
   */
  dispose() {
    this._store.dispose();
  }
};

// src/extensions.ts
Disposiq.prototype.disposeWith = function(container) {
  return container.add(this);
};

// src/is.ts
function isDisposable(value) {
  return typeof value === "object" && value !== null && typeof value.dispose === "function";
}
function isDisposableLike(value) {
  return typeof value === "function" || typeof value === "object" && value !== null && typeof value.dispose === "function";
}
function isDisposableCompat(value) {
  return typeof value === "object" && value !== null && typeof value.dispose === "function" && typeof value[Symbol.dispose] === "function";
}
function isAsyncDisposableCompat(value) {
  return typeof value === "object" && value !== null && typeof value.dispose === "function" && typeof value[Symbol.asyncDispose] === "function";
}
function isSystemDisposable(value) {
  return typeof value === "object" && value !== null && typeof value[Symbol.dispose] === "function";
}
function isSystemAsyncDisposable(value) {
  return typeof value === "object" && value !== null && typeof value[Symbol.asyncDispose] === "function";
}

// src/utils/exception-handler-manager.ts
var ExceptionHandlerManager = class {
  /**
   * Create a new ExceptionHandlerManager with the default handler
   * @param defaultHandler the default handler. If not provided, the default handler will be a no-op
   */
  constructor(defaultHandler) {
    this._handler = this._defaultHandler = typeof defaultHandler === "function" ? defaultHandler : noop;
  }
  /**
   * Get the handler for the manager
   */
  get handler() {
    return this._handler;
  }
  /**
   * Set the handler for the manager
   */
  set handler(value) {
    this._handler = typeof value === "function" ? value : this._defaultHandler;
  }
  /**
   * Reset the handler to the default handler
   */
  reset() {
    this._handler = this._defaultHandler;
  }
  /**
   * Handle an exception
   * @param error the exception to handle
   */
  handle(error) {
    this._handler(error);
  }
  /**
   * Handle an exception safely
   * @param error the exception to handle
   */
  handleSafe(error) {
    try {
      this.handle(error);
    } catch (e) {
    }
  }
};

// src/safe.ts
var safeDisposableExceptionHandlerManager = new ExceptionHandlerManager();
var SafeActionDisposable = class extends Disposiq {
  constructor(action) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._action = typeof action === "function" ? action : noop;
  }
  /**
   * Returns true if the action has been disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the action. If the action has already been disposed, this is a no-op.
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    try {
      this._action();
    } catch (e) {
      safeDisposableExceptionHandlerManager.handle(e);
    }
  }
};
var SafeAsyncActionDisposable = class extends AsyncDisposiq {
  constructor(action) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._action = typeof action === "function" ? action : noopAsync;
  }
  /**
   * Returns true if the action has been disposed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the action. If the action has already been disposed, this is a no-op.
   */
  dispose() {
    return __async(this, null, function* () {
      if (this._disposed) {
        return;
      }
      this._disposed = true;
      try {
        yield this._action();
      } catch (e) {
        safeDisposableExceptionHandlerManager.handle(e);
      }
    });
  }
};

// src/using.ts
function using(resource, action) {
  let result;
  try {
    result = action(resource);
  } catch (e) {
    return runDispose(resource, () => {
      throw e;
    });
  }
  if (result instanceof Promise) {
    return result.then((r) => runDispose(resource, () => r)).catch((e) => runDispose(resource, () => {
      throw e;
    }));
  }
  return runDispose(resource, () => result);
}
function runDispose(disposable, action) {
  const disposeResult = disposable.dispose();
  if (disposeResult instanceof Promise) {
    return disposeResult.then(action);
  }
  return action();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbortDisposable,
  AsyncDisposableAction,
  AsyncDisposiq,
  BaseAsyncDisposable,
  BaseDisposable,
  BoolDisposable,
  BooleanDisposable,
  CompositeDisposable,
  Disposable,
  DisposableAction,
  DisposableContainer,
  DisposableStore,
  Disposiq,
  ObjectDisposedException,
  SafeActionDisposable,
  SafeAsyncActionDisposable,
  SerialDisposable,
  createDisposable,
  createDisposableCompat,
  createDisposiq,
  disposableFromEvent,
  disposableFromEventOnce,
  disposeAll,
  disposeAllSafe,
  disposeAllUnsafe,
  emptyDisposable,
  isAsyncDisposableCompat,
  isDisposable,
  isDisposableCompat,
  isDisposableLike,
  isSystemAsyncDisposable,
  isSystemDisposable,
  on,
  once,
  safeDisposableExceptionHandlerManager,
  toDisposable,
  toDisposableCompat,
  toDisposiq,
  using
});
