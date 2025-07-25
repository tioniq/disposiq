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
var index_exports = {};
__export(index_exports, {
  AbortDisposable: () => AbortDisposable,
  ActionSafeDisposable: () => SafeActionDisposable,
  AsyncActionSafeDisposable: () => SafeAsyncActionDisposable,
  AsyncDisposableAction: () => AsyncDisposableAction,
  AsyncDisposableStore: () => AsyncDisposableStore,
  AsyncDisposiq: () => AsyncDisposiq,
  BaseAsyncDisposable: () => AsyncDisposiq,
  BaseDisposable: () => Disposiq,
  BoolDisposable: () => BoolDisposable,
  BooleanDisposable: () => BoolDisposable,
  CancellationTokenDisposable: () => CancellationTokenDisposable,
  CompositeAsyncDisposable: () => AsyncDisposableStore,
  CompositeDisposable: () => DisposableStore,
  Disposable: () => Disposable,
  DisposableAction: () => DisposableAction,
  DisposableContainer: () => DisposableContainer,
  DisposableDictionary: () => DisposableMapStore,
  DisposableMapStore: () => DisposableMapStore,
  DisposableStore: () => DisposableStore,
  Disposiq: () => Disposiq,
  ObjectDisposedException: () => ObjectDisposedException,
  SafeActionDisposable: () => SafeActionDisposable,
  SafeAsyncActionDisposable: () => SafeAsyncActionDisposable,
  SerialDisposable: () => DisposableContainer,
  WeakRefDisposable: () => WeakRefDisposable,
  addEventListener: () => addEventListener,
  createCancellationTokenDisposable: () => disposableFromCancellationToken,
  createDisposable: () => createDisposable,
  createDisposableCompat: () => createDisposableCompat,
  createDisposiq: () => createDisposiq,
  disposableFromCancellationToken: () => disposableFromCancellationToken,
  disposableFromEvent: () => disposableFromEvent,
  disposableFromEventOnce: () => disposableFromEventOnce,
  disposeAll: () => disposeAll,
  disposeAllAsync: () => disposeAllAsync,
  disposeAllSafe: () => disposeAll,
  disposeAllSafely: () => disposeAllSafely,
  disposeAllSafelyAsync: () => disposeAllSafelyAsync,
  disposeAllUnsafe: () => disposeAllUnsafe,
  disposeAllUnsafeAsync: () => disposeAllUnsafeAsync,
  emptyDisposable: () => emptyDisposable,
  isAsyncDisposableCompat: () => isAsyncDisposableCompat,
  isDisposable: () => isDisposable,
  isDisposableCompat: () => isDisposableCompat,
  isDisposableLike: () => isDisposableLike,
  isSystemAsyncDisposable: () => isSystemAsyncDisposable,
  isSystemDisposable: () => isSystemDisposable,
  justDispose: () => justDispose,
  justDisposeAll: () => justDisposeAll,
  justDisposeAllAsync: () => justDisposeAllAsync,
  justDisposeAsync: () => justDisposeAsync,
  justDisposeSafe: () => justDisposeSafe,
  on: () => disposableFromEvent,
  once: () => disposableFromEventOnce,
  safeDisposableExceptionHandlerManager: () => safeDisposableExceptionHandlerManager,
  toDisposable: () => createDisposable,
  toDisposableCompat: () => createDisposableCompat,
  toDisposiq: () => createDisposiq,
  using: () => using
});
module.exports = __toCommonJS(index_exports);

// src/init.ts
if (!("dispose" in Symbol)) {
  const disposeSymbol = Symbol("Symbol.dispose");
  Symbol.dispose = disposeSymbol;
}
if (!("asyncDispose" in Symbol)) {
  const asyncDisposeSymbol = Symbol(
    "Symbol.asyncDispose"
  );
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
    this._controller = controller != null ? controller : new AbortController();
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
  dispose() {
    this._disposed = true;
  }
};

// src/exception.ts
var ObjectDisposedException = class extends Error {
  constructor(message) {
    super(message || "Object disposed");
    this.name = "ObjectDisposedException";
  }
};

// src/cancellation.ts
function disposableFromCancellationToken(token) {
  return new CancellationTokenDisposable(token);
}
var customDisposeGetter = Object.freeze(() => false);
var CancellationTokenDisposable = class extends Disposiq {
  constructor(token) {
    super();
    if (token == null) {
      throw new Error("Invalid token");
    }
    this._token = token;
    const isCancelledType = typeof token.isCancelled;
    if (isCancelledType === "function") {
      this._disposedGetter = () => token.isCancelled();
    } else if (isCancelledType === "boolean") {
      this._disposedGetter = () => token.isCancelled;
    } else if (typeof token.onCancel === "function") {
      let cancelled = false;
      token.onCancel(() => {
        cancelled = true;
      });
      this._disposedGetter = () => cancelled;
    } else {
      this._disposedGetter = customDisposeGetter;
    }
  }
  get disposed() {
    return this._disposedGetter();
  }
  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message) {
    if (this.disposed) {
      throw new ObjectDisposedException(message);
    }
  }
  dispose() {
    if (this._disposedGetter === customDisposeGetter) {
      this._disposedGetter = () => true;
    }
    this._token.cancel();
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
    this._disposable = disposable == void 0 ? void 0 : createDisposable(disposable);
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
      if (disposable == void 0) {
        return;
      }
      createDisposable(disposable).dispose();
      return;
    }
    const oldDisposable = this._disposable;
    this._disposable = disposable == void 0 ? void 0 : createDisposable(disposable);
    if (oldDisposable !== void 0) {
      oldDisposable.dispose();
    }
  }
  /**
   * Replace the disposable with a new one. Does not dispose the old one
   * @param disposable a new disposable to replace the old one
   */
  replace(disposable) {
    if (this._disposed) {
      if (disposable == void 0) {
        return;
      }
      createDisposable(disposable).dispose();
      return;
    }
    this._disposable = disposable == void 0 ? void 0 : createDisposable(disposable);
  }
  /**
   * Dispose only the current disposable object without affecting the container's state.
   */
  disposeCurrent() {
    const disposable = this._disposable;
    if (disposable === void 0) {
      return;
    }
    this._disposable = void 0;
    disposable.dispose();
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    if (this._disposable === void 0) {
      return;
    }
    const disposable = this._disposable;
    this._disposable = void 0;
    disposable.dispose();
  }
};

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
  if (typeof disposableLike === "object" && "dispose" in disposableLike) {
    return disposableLike;
  }
  return createDisposiqFrom(disposableLike);
}
function createDisposableCompat(disposableLike) {
  return createDisposiqFrom(disposableLike);
}
function createDisposiq(disposableLike) {
  return createDisposiqFrom(disposableLike);
}
function createDisposiqFrom(disposableLike) {
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
  if ("dispose" in disposableLike) {
    return new DisposableAction(() => {
      disposableLike.dispose();
    });
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
  if ("cancel" in disposableLike) {
    return new CancellationTokenDisposable(disposableLike);
  }
  return emptyDisposable;
}

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
var asyncPool = new ObjectPool(10);
function justDispose(disposable) {
  if (!disposable) {
    return;
  }
  if (typeof disposable === "function") {
    disposable();
  } else {
    disposable.dispose();
  }
}
function justDisposeSafe(disposable, onError) {
  if (!disposable) {
    return;
  }
  try {
    if (typeof disposable === "function") {
      disposable();
    } else {
      disposable.dispose();
    }
  } catch (e) {
    onError == null ? void 0 : onError(e);
  }
}
function justDisposeAsync(disposable) {
  return __async(this, null, function* () {
    if (!disposable) {
      return;
    }
    if (typeof disposable === "function") {
      yield disposable();
    } else {
      yield disposable.dispose();
    }
  });
}
function justDisposeAll(disposables) {
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
}
function justDisposeAllAsync(disposables) {
  return __async(this, null, function* () {
    for (let i = 0; i < disposables.length; ++i) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      if (typeof disposable === "function") {
        yield disposable();
      } else {
        yield disposable.dispose();
      }
    }
  });
}
function disposeAll(disposables) {
  const size = disposables.length;
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
  try {
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
  } finally {
    holder.fill(void 0, 0, size);
    if (pool.full) {
      pool.size *= 2;
    }
    pool.throw(holder);
  }
}
function disposeAllAsync(disposables) {
  return __async(this, null, function* () {
    const size = disposables.length;
    if (size === 0) {
      return;
    }
    let holder = asyncPool.lift();
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
    try {
      for (let i = 0; i < size; ++i) {
        const disposable = holder[i];
        if (!disposable) {
          continue;
        }
        if (typeof disposable === "function") {
          yield disposable();
        } else {
          yield disposable.dispose();
        }
      }
    } finally {
      holder.fill(void 0, 0, size);
      if (asyncPool.full) {
        asyncPool.size *= 2;
      }
      asyncPool.throw(holder);
    }
  });
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
function disposeAllUnsafeAsync(disposables) {
  return __async(this, null, function* () {
    for (let i = 0; i < disposables.length; ++i) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      if (typeof disposable === "function") {
        yield disposable();
      } else {
        yield disposable.dispose();
      }
    }
    disposables.length = 0;
  });
}
function disposeAllSafely(disposables, onErrorCallback) {
  if (disposables.length === 0) {
    return;
  }
  for (let i = 0; i < disposables.length; ++i) {
    const disposable = disposables[i];
    if (!disposable) {
      continue;
    }
    try {
      if (typeof disposable === "function") {
        disposable();
      } else {
        disposable.dispose();
      }
    } catch (e) {
      onErrorCallback == null ? void 0 : onErrorCallback(e);
    }
  }
  disposables.length = 0;
}
function disposeAllSafelyAsync(disposables, onErrorCallback) {
  return __async(this, null, function* () {
    if (disposables.length === 0) {
      return;
    }
    for (let i = 0; i < disposables.length; ++i) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      try {
        if (typeof disposable === "function") {
          yield disposable();
        } else {
          yield disposable.dispose();
        }
      } catch (e) {
        onErrorCallback == null ? void 0 : onErrorCallback(e);
      }
    }
    disposables.length = 0;
  });
}

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

// src/map-store.ts
var DisposableMapStore = class extends Disposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._map = /* @__PURE__ */ new Map();
    /**
     * @internal
     */
    this._disposed = false;
  }
  /**
   * Get the disposed state of the store
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed.
   * If the store is disposed, the value will be disposed immediately
   * @param key the key
   * @param value the disposable value
   */
  set(key, value) {
    const disposable = createDisposable(value);
    if (this._disposed) {
      disposable.dispose();
      return;
    }
    const prev = this._map.get(key);
    this._map.set(key, disposable);
    prev == null ? void 0 : prev.dispose();
  }
  /**
   * Get the disposable value for the key
   * @param key the key
   * @returns the disposable value or undefined if the key is not found
   */
  get(key) {
    if (this._disposed) {
      return;
    }
    return this._map.get(key);
  }
  /**
   * Delete the disposable value for the key
   * @param key the key
   * @returns true if the key was found and the value was deleted, false otherwise
   */
  delete(key) {
    if (this._disposed) {
      return false;
    }
    const disposable = this._map.get(key);
    if (!disposable) {
      return false;
    }
    this._map.delete(key);
    disposable.dispose();
    return true;
  }
  /**
   * Remove the disposable value for the key and return it. The disposable value will not be disposed
   * @param key the key
   * @returns the disposable value or undefined if the key is not found
   */
  extract(key) {
    if (this._disposed) {
      return;
    }
    const disposable = this._map.get(key);
    if (!disposable) {
      return;
    }
    this._map.delete(key);
    return disposable;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    for (const value of this._map.values()) {
      value.dispose();
    }
    this._map.clear();
  }
};

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

// src/store.ts
var DisposableStore = class _DisposableStore extends Disposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._disposables = [];
    /**
     * @internal
     */
    this._disposed = false;
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
    if (!disposables || disposables.length === 0) {
      return;
    }
    const first = disposables[0];
    const value = Array.isArray(first) ? first : disposables;
    if (this._disposed) {
      justDisposeAll(value);
      return;
    }
    for (let i = 0; i < value.length; i++) {
      const disposable = value[i];
      if (!disposable) {
        continue;
      }
      this._disposables.push(disposable);
    }
  }
  /**
   * Add multiple disposables to the store. If the store has already been disposed, the disposables will be disposed.
   * @param disposables an array of disposables to add
   */
  addAll(disposables) {
    if (!disposables || disposables.length === 0) {
      return;
    }
    if (this._disposed) {
      justDisposeAll(disposables);
      return;
    }
    for (let i = 0; i < disposables.length; i++) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      this._disposables.push(disposable);
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
      justDispose(disposable);
      return;
    }
    this._disposables.push(disposable);
  }
  /**
   * Adds a disposable resource safely to the internal disposables collection.
   * If the containing object is already disposed, the given disposable resource
   * will be disposed immediately.
   * Safely means that the method will not throw an exception if an error occurs
   * during disposal of the resource.
   * You CAN NOT remove the disposable from the store after adding it with this method.
   *
   * @param {DisposableLike | null | undefined} disposable - The disposable resource to be added.
   *   If null or undefined, the method does nothing.
   * @param {(error: unknown) => void} [onError] - An optional callback that is invoked when an
   *   error occurs during disposal of the resource.
   * @return {void}
   */
  addOneSafe(disposable, onError) {
    if (!disposable) {
      return;
    }
    if (this._disposed) {
      justDisposeSafe(disposable, onError);
      return;
    }
    this._disposables.push(() => {
      justDisposeSafe(disposable, onError);
    });
  }
  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
   * @param disposable a disposable to remove
   * @returns true if the disposable was found and removed
   */
  remove(disposable) {
    if (!disposable || this._disposed) {
      return false;
    }
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
      this.addOne(() => clearTimeout(handle));
      return;
    }
    this.addOne(() => clearTimeout(callbackOrTimeout));
  }
  /**
   * @internal
   */
  addInterval(callbackOrInterval, interval) {
    if (typeof callbackOrInterval === "function") {
      const handle = setInterval(callbackOrInterval, interval);
      this.addOne(() => clearInterval(handle));
      return;
    }
    this.addOne(() => clearInterval(callbackOrInterval));
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
   * Accepts a function that returns a disposable and adds it to the store. If the function is asynchronous,
   * it waits for the result and then adds it to the store. Returns a Promise if the supplier is asynchronous,
   * otherwise returns the disposable directly.
   * @param supplier A function that returns a disposable or a promise resolving to a disposable.
   * @returns The disposable or a promise resolving to the disposable.
   */
  use(supplier) {
    const result = supplier();
    if (result instanceof Promise) {
      return result.then((disposable) => {
        if (this._disposed) {
          justDispose(disposable);
          return disposable;
        }
        this._disposables.push(disposable);
        return disposable;
      });
    }
    if (this._disposed) {
      justDispose(result);
      return result;
    }
    this._disposables.push(result);
    return result;
  }
  /**
   * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
   * store. The store can continue to be used after this method is called. This method is useful when the store is
   * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
   * this method will safely add the disposable to the store without disposing it immediately.
   */
  disposeCurrent() {
    if (this._disposed) {
      return;
    }
    disposeAll(this._disposables);
  }
  /**
   * Dispose the store and all disposables safely. If an error occurs during disposal, the error is caught and
   * passed to the onErrorCallback.
   */
  disposeSafely(onErrorCallback) {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    disposeAllSafely(this._disposables, onErrorCallback);
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    disposeAllUnsafe(this._disposables);
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

// src/store-async.ts
var AsyncDisposableStore = class _AsyncDisposableStore extends AsyncDisposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._disposables = [];
    /**
     * @internal
     */
    this._disposed = false;
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
   * @returns void if the container has not been disposed, otherwise a promise that resolves when all disposables have been disposed
   */
  add(...disposables) {
    if (!disposables || disposables.length === 0) {
      return;
    }
    const first = disposables[0];
    const value = Array.isArray(first) ? first : disposables;
    if (this._disposed) {
      return justDisposeAllAsync(value);
    }
    for (let i = 0; i < value.length; i++) {
      const disposable = value[i];
      if (!disposable) {
        continue;
      }
      this._disposables.push(
        disposable
      );
    }
  }
  addAll(disposables) {
    if (!disposables || disposables.length === 0) {
      return;
    }
    if (this._disposed) {
      return justDisposeAllAsync(disposables);
    }
    for (let i = 0; i < disposables.length; i++) {
      const disposable = disposables[i];
      if (!disposable) {
        continue;
      }
      this._disposables.push(disposable);
    }
  }
  /**
   * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
   * @param disposable a disposable to add
   * @returns void if the container has not been disposed, otherwise a promise that resolves when the disposable has been disposed
   */
  addOne(disposable) {
    if (!disposable) {
      return;
    }
    if (this._disposed) {
      return justDisposeAsync(disposable);
    }
    this._disposables.push(disposable);
  }
  /**
   * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
   * @param disposable the disposable to remove
   * @returns true if the disposable was removed, false otherwise
   */
  remove(disposable) {
    if (!disposable || this._disposed) {
      return false;
    }
    const index = this._disposables.indexOf(disposable);
    if (index === -1) {
      return false;
    }
    this._disposables.splice(index, 1);
    return true;
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
   * Dispose all disposables in the store. The store does not become disposed.
   */
  disposeCurrent() {
    if (this._disposed) {
      return Promise.resolve();
    }
    return disposeAllAsync(this._disposables);
  }
  /**
   * Dispose all disposables in the store safely. The store becomes disposed.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeSafely(onErrorCallback) {
    if (this._disposed) {
      return;
    }
    return disposeAllSafelyAsync(this._disposables, onErrorCallback);
  }
  dispose() {
    if (this._disposed) {
      return Promise.resolve();
    }
    this._disposed = true;
    return disposeAllUnsafeAsync(this._disposables);
  }
  static from(disposables, mapper) {
    if (typeof mapper === "function") {
      const store2 = new _AsyncDisposableStore();
      store2.add(disposables.map(mapper));
      return store2;
    }
    const store = new _AsyncDisposableStore();
    store.addAll(disposables);
    return store;
  }
};

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
  registerAsync(promiseOrAction) {
    return __async(this, null, function* () {
      if (typeof promiseOrAction === "function") {
        return this._store.use(promiseOrAction);
      }
      if (promiseOrAction instanceof Promise) {
        const disposable = yield promiseOrAction;
        this._store.addOne(disposable);
        return disposable;
      }
      this._store.addOne(promiseOrAction);
      return promiseOrAction;
    });
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
  dispose() {
    this._store.dispose();
  }
};

// src/dom.ts
function addEventListener(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return new DisposableAction(
    () => target.removeEventListener(type, listener, options)
  );
}

// src/extensions.ts
Disposiq.prototype.disposeWith = function(container) {
  if (container instanceof Disposable) {
    container.addDisposable(this);
    return;
  }
  container.add(this);
};
Disposiq.prototype.toFunction = function() {
  return () => {
    this.dispose();
  };
};
var g = globalThis;
Disposiq.prototype.disposeIn = function(ms) {
  g.setTimeout(() => {
    this.dispose();
  }, ms);
};
Disposiq.prototype.toPlainObject = function() {
  return {
    dispose: () => {
      this.dispose();
    }
  };
};
Disposiq.prototype.embedTo = function(obj) {
  if ("dispose" in obj && typeof obj.dispose === "function") {
    const objDispose = obj.dispose;
    obj.dispose = () => {
      objDispose.call(obj);
      this.dispose();
    };
    return obj;
  }
  obj.dispose = () => {
    this.dispose();
  };
  return obj;
};
Disposiq.prototype.toSafe = function(errorCallback) {
  const self = this;
  return new class extends Disposiq {
    dispose() {
      try {
        self.dispose();
      } catch (e) {
        if (errorCallback) {
          errorCallback(e);
        }
      }
    }
  }();
};
AsyncDisposiq.prototype.toSafe = function(errorCallback) {
  const self = this;
  return new class extends AsyncDisposiq {
    dispose() {
      return __async(this, null, function* () {
        try {
          yield self.dispose();
        } catch (e) {
          if (errorCallback) {
            errorCallback(e);
          }
        }
      });
    }
  }();
};

// src/is.ts
function isDisposable(value) {
  return typeof value === "object" && value !== null && // @ts-ignore
  typeof value.dispose === "function";
}
function isDisposableLike(value) {
  return typeof value === "function" || typeof value === "object" && value !== null && // @ts-ignore
  typeof value.dispose === "function";
}
function isDisposableCompat(value) {
  return typeof value === "object" && value !== null && // @ts-ignore
  typeof value.dispose === "function" && // @ts-ignore
  typeof value[Symbol.dispose] === "function";
}
function isAsyncDisposableCompat(value) {
  return typeof value === "object" && value !== null && // @ts-ignore
  typeof value.dispose === "function" && // @ts-ignore
  typeof value[Symbol.asyncDispose] === "function";
}
function isSystemDisposable(value) {
  return typeof value === "object" && value !== null && // @ts-ignore
  typeof value[Symbol.dispose] === "function";
}
function isSystemAsyncDisposable(value) {
  return typeof value === "object" && value !== null && // @ts-ignore
  typeof value[Symbol.asyncDispose] === "function";
}

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
    return result.then((r) => runDispose(resource, () => r)).catch(
      (e) => runDispose(resource, () => {
        throw e;
      })
    );
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

// src/weak-ref-disposable.ts
var WeakRefDisposable = class extends Disposiq {
  constructor(value) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._value = value instanceof WeakRef ? value : new WeakRef(value);
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    const value = this._value.deref();
    if (!value) {
      return;
    }
    createDisposable(value).dispose();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbortDisposable,
  ActionSafeDisposable,
  AsyncActionSafeDisposable,
  AsyncDisposableAction,
  AsyncDisposableStore,
  AsyncDisposiq,
  BaseAsyncDisposable,
  BaseDisposable,
  BoolDisposable,
  BooleanDisposable,
  CancellationTokenDisposable,
  CompositeAsyncDisposable,
  CompositeDisposable,
  Disposable,
  DisposableAction,
  DisposableContainer,
  DisposableDictionary,
  DisposableMapStore,
  DisposableStore,
  Disposiq,
  ObjectDisposedException,
  SafeActionDisposable,
  SafeAsyncActionDisposable,
  SerialDisposable,
  WeakRefDisposable,
  addEventListener,
  createCancellationTokenDisposable,
  createDisposable,
  createDisposableCompat,
  createDisposiq,
  disposableFromCancellationToken,
  disposableFromEvent,
  disposableFromEventOnce,
  disposeAll,
  disposeAllAsync,
  disposeAllSafe,
  disposeAllSafely,
  disposeAllSafelyAsync,
  disposeAllUnsafe,
  disposeAllUnsafeAsync,
  emptyDisposable,
  isAsyncDisposableCompat,
  isDisposable,
  isDisposableCompat,
  isDisposableLike,
  isSystemAsyncDisposable,
  isSystemDisposable,
  justDispose,
  justDisposeAll,
  justDisposeAllAsync,
  justDisposeAsync,
  justDisposeSafe,
  on,
  once,
  safeDisposableExceptionHandlerManager,
  toDisposable,
  toDisposableCompat,
  toDisposiq,
  using
});
