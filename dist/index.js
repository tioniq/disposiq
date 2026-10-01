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

// src/init.ts
if (!("dispose" in Symbol)) {
  const disposeSymbol = /* @__PURE__ */ Symbol("Symbol.dispose");
  Symbol.dispose = disposeSymbol;
}
if (!("asyncDispose" in Symbol)) {
  const asyncDisposeSymbol = /* @__PURE__ */ Symbol(
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

// src/utils/disposing.ts
var resolvedPromise = Promise.resolve();
function onSettled(promise, callback) {
  return promise.then(callback, (e) => {
    callback();
    throw e;
  });
}
function invokeAsync(action) {
  return __async(this, null, function* () {
    yield action();
  });
}

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
    const action = this._action;
    this._action = noop;
    action();
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
   * Returns true if the action has been disposed. It becomes true as soon as dispose is called, before the action
   * has completed.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Dispose the action. The action is invoked once; calls made while it is running return the same promise (which
   * rejects if the action fails), later calls resolve immediately.
   */
  dispose() {
    var _a;
    if (this._disposed) {
      return (_a = this._disposing) != null ? _a : resolvedPromise;
    }
    this._disposed = true;
    const action = this._action;
    this._action = noopAsync;
    const disposing = onSettled(invokeAsync(action), () => {
      this._disposing = void 0;
    });
    this._disposing = disposing;
    return disposing;
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

// src/exception.ts
var ObjectDisposedException = class extends Error {
  constructor(message) {
    super(message || "Object disposed");
    this.name = "ObjectDisposedException";
  }
};
var OperationCancelledException = class extends Error {
  constructor(message) {
    super(message || "Operation cancelled");
    this.name = "OperationCancelledException";
  }
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
    } catch (_e) {
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
    const action = this._action;
    this._action = noop;
    try {
      action();
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
   * Dispose the action. If the action has already been disposed, this is a no-op. Calls made while the action is
   * running return a promise that settles when it completes.
   */
  dispose() {
    var _a;
    if (this._disposed) {
      return (_a = this._disposing) != null ? _a : resolvedPromise;
    }
    this._disposed = true;
    const action = this._action;
    this._action = noopAsync;
    const disposing = invokeAsync(action).then(
      () => {
        this._disposing = void 0;
      },
      (e) => {
        this._disposing = void 0;
        safeDisposableExceptionHandlerManager.handle(e);
      }
    );
    this._disposing = disposing;
    return disposing;
  }
};

// src/timer.ts
function callHandle(handle, method) {
  const fn = handle[method];
  if (typeof fn === "function") {
    fn.call(handle);
  }
}
var TimeoutDisposable = class extends Disposiq {
  constructor(callback, ms, options) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    /**
     * @internal
     */
    this._fired = false;
    this._handle = setTimeout(() => {
      this._fired = true;
      this._disposed = true;
      callback();
    }, ms);
    if (options == null ? void 0 : options.unref) {
      callHandle(this._handle, "unref");
    }
  }
  /**
   * Returns true once the timeout has fired or has been disposed
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Returns true if the callback has been called
   */
  get fired() {
    return this._fired;
  }
  /**
   * Let the process exit while the timeout is pending (where the platform supports it)
   */
  unref() {
    callHandle(this._handle, "unref");
    return this;
  }
  /**
   * Keep the process alive while the timeout is pending (the default)
   */
  ref() {
    callHandle(this._handle, "ref");
    return this;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    clearTimeout(this._handle);
  }
};
var IntervalDisposable = class extends Disposiq {
  constructor(callback, ms, options) {
    super();
    /**
     * @internal
     */
    this._disposed = false;
    this._handle = setInterval(callback, ms);
    if (options == null ? void 0 : options.unref) {
      callHandle(this._handle, "unref");
    }
  }
  /**
   * Returns true if the interval has been disposed
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * Let the process exit while the interval is running (where the platform supports it)
   */
  unref() {
    callHandle(this._handle, "unref");
    return this;
  }
  /**
   * Keep the process alive while the interval is running (the default)
   */
  ref() {
    callHandle(this._handle, "ref");
    return this;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    clearInterval(this._handle);
  }
};

// src/utils/errors.ts
function throwCollected(errors) {
  if (errors === void 0) {
    return;
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  const aggregate = globalThis.AggregateError;
  if (typeof aggregate === "function") {
    throw new aggregate(errors, "Multiple errors occurred during disposal");
  }
  throw errors[0];
}

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
      this._disposedGetter = () => token.isCancelled.call(token);
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
var CancellationToken = class _CancellationToken extends Disposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._cancelled = false;
    /**
     * @internal
     */
    this._callbacks = [];
  }
  /**
   * Create a token that is cancelled after the given time. Disposing the token clears the timer without cancelling
   * it. An error thrown by a callback when the timer fires goes to {@link safeDisposableExceptionHandlerManager}.
   * @param ms the time in milliseconds
   * @param options timer options
   */
  static timeout(ms, options) {
    const token = new _CancellationToken();
    const timeout = new TimeoutDisposable(() => {
      try {
        token.cancel();
      } catch (e) {
        safeDisposableExceptionHandlerManager.handle(e);
      }
    }, ms, options);
    token._detach = () => timeout.dispose();
    return token;
  }
  /**
   * Create a token that is cancelled when any of the given tokens is cancelled, or by its own `cancel()`. It is
   * created cancelled if one of them is already cancelled. Disposing it unsubscribes it from the given tokens without
   * cancelling it. Tokens without an `onCancel` method are only checked once, when the token is created.
   * @param tokens the tokens to follow; null and undefined are skipped
   */
  static merge(...tokens) {
    const token = new _CancellationToken();
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] && isTokenCancelled(tokens[i])) {
        token._cancelled = true;
        return token;
      }
    }
    const subscriptions = [];
    let following = true;
    const unsubscribe = () => {
      following = false;
      const current = subscriptions.splice(0);
      for (let i = 0; i < current.length; i++) {
        current[i]();
      }
    };
    token._detach = unsubscribe;
    const cancel = () => {
      if (following) {
        token.cancel();
      }
    };
    for (let i = 0; i < tokens.length && !token._cancelled; i++) {
      const parent = tokens[i];
      if (!parent || typeof parent.onCancel !== "function") {
        continue;
      }
      const subscription = parent.onCancel(cancel);
      if (isDisposable(subscription)) {
        subscriptions.push(() => subscription.dispose());
      } else if (typeof parent.removeCallback === "function") {
        subscriptions.push(() => parent.removeCallback(cancel));
      }
    }
    if (token._cancelled) {
      unsubscribe();
    }
    return token;
  }
  /**
   * Returns true if the token has been cancelled
   */
  isCancelled() {
    return this._cancelled;
  }
  /**
   * Throw an {@link OperationCancelledException} if the token has been cancelled
   * @param message the message to include in the exception
   */
  throwIfCancelled(message) {
    if (this._cancelled) {
      throw new OperationCancelledException(message);
    }
  }
  /**
   * Register a callback to call when the token is cancelled. On a cancelled token the callback is called at once.
   * @param callback the callback
   * @returns a disposable that unregisters the callback
   */
  onCancel(callback) {
    if (this._cancelled) {
      callback();
      return emptyDisposable;
    }
    this._callbacks.push(callback);
    return new DisposableAction(() => {
      this.removeCallback(callback);
    });
  }
  /**
   * Unregister a callback registered with `onCancel`
   * @param callback the callback
   */
  removeCallback(callback) {
    const index = this._callbacks.indexOf(callback);
    if (index !== -1) {
      this._callbacks.splice(index, 1);
    }
  }
  /**
   * Cancel the token and call the registered callbacks in the order they were registered. Every callback is called
   * even if some of them throw; the error is rethrown afterwards (several errors are wrapped in an AggregateError).
   * Cancelling more than once is a no-op.
   */
  cancel() {
    if (this._cancelled) {
      return;
    }
    this._cancelled = true;
    this._release();
    const callbacks = this._callbacks;
    this._callbacks = [];
    let errors;
    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i]();
      } catch (e) {
        if (errors === void 0) {
          errors = [e];
        } else {
          errors.push(e);
        }
      }
    }
    throwCollected(errors);
  }
  /**
   * Detach the token from its timer or parent tokens without cancelling it. The token keeps its state and its
   * callbacks, and `cancel()` still works.
   */
  dispose() {
    this._release();
  }
  /**
   * @internal
   */
  _release() {
    const detach = this._detach;
    if (detach === void 0) {
      return;
    }
    this._detach = void 0;
    detach();
  }
};
function isTokenCancelled(token) {
  const isCancelled = token.isCancelled;
  if (typeof isCancelled === "function") {
    return isCancelled.call(token);
  }
  return isCancelled === true;
}
function timeoutToken(ms, options) {
  return CancellationToken.timeout(ms, options);
}
function mergeTokens(...tokens) {
  return CancellationToken.merge(...tokens);
}
function onCancel(token, callback) {
  let active = true;
  const listener = () => {
    if (active) {
      callback();
    }
  };
  const subscription = token.onCancel(listener);
  return new DisposableAction(() => {
    active = false;
    if (isDisposable(subscription)) {
      subscription.dispose();
    } else if (typeof token.removeCallback === "function") {
      token.removeCallback(listener);
    }
  });
}

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
   * Set the new disposable and dispose the old one. Setting the current disposable again does not dispose it
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
    if (oldDisposable !== void 0 && oldDisposable !== this._disposable) {
      oldDisposable.dispose();
    }
  }
  /**
   * Replace the disposable with a new one. Does not dispose the old one
   * @param disposable a new disposable to replace the old one
   * @returns the old disposable object or undefined if the container is disposed.
   */
  replace(disposable) {
    if (this._disposed) {
      if (disposable == void 0) {
        return void 0;
      }
      createDisposable(disposable).dispose();
      return void 0;
    }
    const oldDisposable = this._disposable;
    this._disposable = disposable == void 0 ? void 0 : createDisposable(disposable);
    return oldDisposable;
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
    return new AsyncDisposableAction(() => __async(null, null, function* () {
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
var maxPooledHolderLength = 1024;
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
function disposeRange(disposables, length) {
  let errors;
  for (let i = 0; i < (length != null ? length : disposables.length); ++i) {
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
      if (errors === void 0) {
        errors = [e];
      } else {
        errors.push(e);
      }
    }
  }
  return errors;
}
function disposeRangeAsync(disposables, length) {
  return __async(this, null, function* () {
    let errors;
    for (let i = 0; i < (length != null ? length : disposables.length); ++i) {
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
        if (errors === void 0) {
          errors = [e];
        } else {
          errors.push(e);
        }
      }
    }
    return errors;
  });
}
function justDisposeAll(disposables) {
  throwCollected(disposeRange(disposables));
}
function justDisposeAllAsync(disposables) {
  return __async(this, null, function* () {
    throwCollected(yield disposeRangeAsync(disposables));
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
  let errors;
  try {
    errors = disposeRange(holder, size);
  } finally {
    holder.fill(void 0, 0, size);
    if (holder.length <= maxPooledHolderLength) {
      if (pool.full) {
        pool.size *= 2;
      }
      pool.throw(holder);
    }
  }
  throwCollected(errors);
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
    let errors;
    try {
      errors = yield disposeRangeAsync(holder, size);
    } finally {
      holder.fill(void 0, 0, size);
      if (holder.length <= maxPooledHolderLength) {
        if (asyncPool.full) {
          asyncPool.size *= 2;
        }
        asyncPool.throw(holder);
      }
    }
    throwCollected(errors);
  });
}
function disposeAllUnsafe(disposables) {
  let errors;
  try {
    errors = disposeRange(disposables);
  } finally {
    disposables.length = 0;
  }
  throwCollected(errors);
}
function disposeAllUnsafeAsync(disposables) {
  return __async(this, null, function* () {
    let errors;
    try {
      errors = yield disposeRangeAsync(disposables);
    } finally {
      disposables.length = 0;
    }
    throwCollected(errors);
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
      reportError(onErrorCallback, e);
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
        reportError(onErrorCallback, e);
      }
    }
    disposables.length = 0;
  });
}
function reportError(onErrorCallback, error) {
  if (!onErrorCallback) {
    return;
  }
  try {
    onErrorCallback(error);
  } catch (e) {
    safeDisposableExceptionHandlerManager.handle(e);
  }
}

// src/event.ts
function disposableFromEvent(emitter, event, listener) {
  emitter.on(event, listener);
  return new DisposableAction(() => {
    emitter.off(event, listener);
  });
}
function disposableFromEventOnce(emitter, event, listener) {
  if (typeof emitter.once === "function") {
    emitter.once(event, listener);
    return new DisposableAction(() => {
      emitter.off(event, listener);
    });
  }
  const wrapper = ((...args) => {
    emitter.off(event, wrapper);
    return listener(...args);
  });
  emitter.on(event, wrapper);
  return new DisposableAction(() => {
    emitter.off(event, wrapper);
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
   * The number of values in the store
   */
  get size() {
    return this._map.size;
  }
  /**
   * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed
   * (unless it is the same value).
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
    if (prev === disposable) {
      return;
    }
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
   * Check whether the store has a value for the key
   * @param key the key
   */
  has(key) {
    return this._map.has(key);
  }
  /**
   * The keys of the store, in insertion order
   */
  keys() {
    return this._map.keys();
  }
  /**
   * The values of the store, in insertion order
   */
  values() {
    return this._map.values();
  }
  /**
   * The key-value pairs of the store, in insertion order
   */
  entries() {
    return this._map.entries();
  }
  [Symbol.iterator]() {
    return this._map.entries();
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
    const values = Array.from(this._map.values());
    this._map.clear();
    justDisposeAll(values);
  }
};

// src/utils/owned-timers.ts
var OwnedTimeout = class extends TimeoutDisposable {
  constructor(owner, callback, ms, options) {
    super(() => {
      owner.remove(this);
      callback();
    }, ms, options);
    this._owner = owner;
  }
  dispose() {
    super.dispose();
    this._owner.remove(this);
  }
};
var OwnedInterval = class extends IntervalDisposable {
  constructor(owner, callback, ms, options) {
    super(callback, ms, options);
    this._owner = owner;
  }
  dispose() {
    super.dispose();
    this._owner.remove(this);
  }
};
function createOwnedTimeout(owner, push, callback, ms, options) {
  const timeout = new OwnedTimeout(owner, callback, ms, options);
  if (owner.disposed) {
    timeout.dispose();
    return timeout;
  }
  push(timeout);
  return timeout;
}
function createOwnedInterval(owner, push, callback, ms, options) {
  const interval = new OwnedInterval(owner, callback, ms, options);
  if (owner.disposed) {
    interval.dispose();
    return interval;
  }
  push(interval);
  return interval;
}

// src/store.ts
var DisposableStore = class _DisposableStore extends Disposiq {
  constructor(options) {
    super();
    /**
     * @internal
     */
    this._disposables = [];
    /**
     * @internal
     */
    this._disposed = false;
    this.order = (options == null ? void 0 : options.order) === "lifo" ? "lifo" : "fifo";
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
  addTimeout(callbackOrTimeout, timeout, options) {
    if (typeof callbackOrTimeout === "function") {
      return createOwnedTimeout(this, (t) => this._disposables.push(t), callbackOrTimeout, timeout, options);
    }
    this.addOne(() => clearTimeout(callbackOrTimeout));
    return void 0;
  }
  /**
   * @internal
   */
  addInterval(callbackOrInterval, interval, options) {
    if (typeof callbackOrInterval === "function") {
      return createOwnedInterval(this, (t) => this._disposables.push(t), callbackOrInterval, interval, options);
    }
    this.addOne(() => clearInterval(callbackOrInterval));
    return void 0;
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
    disposeAll(this._ordered());
  }
  /**
   * Dispose all disposables in the store like {@link disposeCurrent}, passing each error to the callback instead of
   * throwing. The store does not become disposed.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeCurrentSafely(onErrorCallback) {
    if (this._disposed) {
      return;
    }
    disposeAllSafely(this._ordered().splice(0), onErrorCallback);
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
    disposeAllSafely(this._ordered(), onErrorCallback);
  }
  /**
   * Dispose the store and all disposables in the store's {@link order}. Every disposable is disposed even if some of
   * them throw; the error is rethrown afterwards (several errors are wrapped in an AggregateError).
   */
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    disposeAllUnsafe(this._ordered());
  }
  /**
   * The items, arranged in the order they are disposed in
   * @internal
   */
  _ordered() {
    return this.order === "lifo" ? this._disposables.reverse() : this._disposables;
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
  constructor(options) {
    super();
    /**
     * @internal
     */
    this._disposables = [];
    /**
     * @internal
     */
    this._disposed = false;
    this.order = (options == null ? void 0 : options.order) === "lifo" ? "lifo" : "fifo";
    this.serial = (options == null ? void 0 : options.serial) === true;
  }
  /**
   * Returns true if the object has been disposed. It becomes true as soon as dispose or disposeSafely is called,
   * before the disposables have finished disposing.
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
   * Add a timeout to the store. The store clears it when disposed, and it leaves the store once it has fired. If the
   * store has already been disposed, the callback is never called.
   * @param callback a callback to call when the timeout expires
   * @param timeout the number of milliseconds to wait before calling the callback
   * @param options timer options
   * @returns the timeout; disposing it clears the timeout
   */
  addTimeout(callback, timeout, options) {
    return createOwnedTimeout(this, (t) => this._disposables.push(t), callback, timeout, options);
  }
  /**
   * Add an interval to the store. The store clears it when disposed. If the store has already been disposed, the
   * interval is cleared at once.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   * @param options timer options
   * @returns the interval; disposing it clears the interval
   */
  addInterval(callback, interval, options) {
    return createOwnedInterval(this, (t) => this._disposables.push(t), callback, interval, options);
  }
  /**
   * Dispose all disposables in the store. The store does not become disposed. Every disposable is disposed even if
   * some of them reject; the returned promise then rejects with the error (several errors are wrapped in an
   * AggregateError). On a serial store the round starts after the previous one has finished, and on a disposed
   * serial store the returned promise settles when the disposal has finished.
   */
  disposeCurrent() {
    if (this._disposed) {
      return this.serial ? this._whenDisposed() : Promise.resolve();
    }
    if (!this.serial) {
      return disposeAllAsync(this._ordered());
    }
    const items = this._ordered().splice(0);
    return this._enqueueRound(() => disposeAllUnsafeAsync(items));
  }
  /**
   * Dispose all disposables in the store like {@link disposeCurrent}, passing each error to the callback instead of
   * rejecting. The store does not become disposed.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeCurrentSafely(onErrorCallback) {
    if (this._disposed) {
      return this.serial ? this._whenDisposed() : resolvedPromise;
    }
    const items = this._ordered().splice(0);
    if (!this.serial) {
      return disposeAllSafelyAsync(items, onErrorCallback);
    }
    return this._enqueueRound(() => disposeAllSafelyAsync(items, onErrorCallback));
  }
  /**
   * Dispose all disposables in the store safely. The store becomes disposed immediately. Errors are passed to the
   * callback and never reject the returned promise. If a disposal is already in progress, the returned promise
   * settles when it completes.
   * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
   */
  disposeSafely(onErrorCallback) {
    if (this._disposed) {
      return this._whenDisposed();
    }
    this._disposed = true;
    const items = this._ordered();
    return this._track(
      this._afterRound(() => disposeAllSafelyAsync(items, onErrorCallback))
    );
  }
  /**
   * Dispose the store and all disposables in the store's {@link order}. The store becomes disposed immediately. Every
   * disposable is disposed even if some of them reject; the returned promise then rejects with the error (several
   * errors are wrapped in an AggregateError). Calls made while the disposal is in progress return the same promise,
   * later calls resolve immediately. On a serial store the disposal starts after a `disposeCurrent` in progress.
   */
  dispose() {
    var _a;
    if (this._disposed) {
      return (_a = this._disposing) != null ? _a : resolvedPromise;
    }
    this._disposed = true;
    const items = this._ordered();
    return this._track(this._afterRound(() => disposeAllUnsafeAsync(items)));
  }
  /**
   * The items, arranged in the order they are disposed in
   * @internal
   */
  _ordered() {
    return this.order === "lifo" ? this._disposables.reverse() : this._disposables;
  }
  /**
   * Settles when the disposal has finished; never rejects
   * @internal
   */
  _whenDisposed() {
    const disposing = this._disposing;
    return disposing === void 0 ? resolvedPromise : disposing.then(noop, noop);
  }
  /**
   * Run the action once the latest disposeCurrent round has finished (at once if there is none)
   * @internal
   */
  _afterRound(action) {
    const previous = this._round;
    return previous === void 0 ? action() : previous.then(action);
  }
  /**
   * @internal
   */
  _enqueueRound(action) {
    const round = this._afterRound(action);
    const settled = round.then(noop, noop);
    this._round = settled;
    settled.then(() => {
      if (this._round === settled) {
        this._round = void 0;
      }
    });
    return round;
  }
  /**
   * @internal
   */
  _track(promise) {
    const disposing = onSettled(promise, () => {
      this._disposing = void 0;
    });
    this._disposing = disposing;
    return disposing;
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

// src/container-async.ts
var AsyncDisposableContainer = class extends AsyncDisposiq {
  constructor(disposable = void 0) {
    super();
    /**
     * Disposals of replaced values that are still in progress; they never reject
     * @internal
     */
    this._releasing = /* @__PURE__ */ new Set();
    /**
     * @internal
     */
    this._disposed = false;
    this._disposable = disposable == void 0 ? void 0 : disposable;
  }
  /**
   * Returns true if the container is disposed. It becomes true as soon as dispose is called, before the current value
   * has finished disposing.
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
   * Set the new disposable and dispose the old one. Setting the current disposable again does not dispose it. If the
   * container is disposed, the new disposable is disposed instead.
   * @param disposable a new disposable to set
   * @returns a promise that settles when the old (or rejected) disposable has been disposed, and rejects if that fails
   */
  set(disposable) {
    const value = disposable == void 0 ? void 0 : disposable;
    if (this._disposed) {
      return value === void 0 ? resolvedPromise : this._release(value);
    }
    const prev = this._disposable;
    this._disposable = value;
    return prev === void 0 || prev === value ? resolvedPromise : this._release(prev);
  }
  /**
   * Replace the disposable with a new one. Does not dispose the old one. If the container is disposed, the new
   * disposable is disposed, and an error of that disposal goes to {@link safeDisposableExceptionHandlerManager}
   * @param disposable a new disposable to replace the old one
   * @returns the old disposable object or undefined if the container is disposed
   */
  replace(disposable) {
    const value = disposable == void 0 ? void 0 : disposable;
    if (this._disposed) {
      if (value !== void 0) {
        this._release(value).then(
          void 0,
          (e) => safeDisposableExceptionHandlerManager.handle(e)
        );
      }
      return void 0;
    }
    const prev = this._disposable;
    this._disposable = value;
    return prev;
  }
  /**
   * Dispose only the current disposable object, leaving the container empty and usable
   * @returns a promise that settles when the disposable has been disposed, and rejects if that fails
   */
  disposeCurrent() {
    const disposable = this._disposable;
    if (disposable === void 0) {
      return resolvedPromise;
    }
    this._disposable = void 0;
    return this._release(disposable);
  }
  /**
   * Dispose the container and the current disposable, after the disposals of replaced values that are already in
   * progress. The returned promise rejects if disposing the current disposable fails. Calls made while the disposal is
   * in progress return the same promise, later calls resolve immediately.
   */
  dispose() {
    var _a;
    if (this._disposed) {
      return (_a = this._disposing) != null ? _a : resolvedPromise;
    }
    this._disposed = true;
    const disposable = this._disposable;
    this._disposable = void 0;
    const running = Array.from(this._releasing);
    const disposing = onSettled(
      Promise.all(running).then(() => justDisposeAsync(disposable)),
      () => {
        this._disposing = void 0;
      }
    );
    this._disposing = disposing;
    return disposing;
  }
  /**
   * @internal
   */
  _release(value) {
    const release = justDisposeAsync(value);
    const settled = release.then(noop, noop);
    this._releasing.add(settled);
    settled.then(() => {
      this._releasing.delete(settled);
    });
    return release;
  }
};

// src/disposable.ts
var Disposable = class extends Disposiq {
  /**
   * @param options the order in which the registered disposables are disposed; `fifo` by default
   */
  constructor(options) {
    super();
    this._store = new DisposableStore(options);
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

// src/disposable-async.ts
var AsyncDisposable = class extends AsyncDisposiq {
  constructor(options) {
    super();
    this._store = new AsyncDisposableStore({ order: options == null ? void 0 : options.order });
    this._onError = options == null ? void 0 : options.onError;
  }
  /**
   * Returns true if the object has been disposed. It becomes true as soon as dispose is called, before the registered
   * disposables have finished disposing.
   */
  get disposed() {
    return this._store.disposed;
  }
  /**
   * Register a disposable object. The object will be disposed when the current object is disposed. If the current
   * object has already been disposed, the disposable is disposed at once.
   * @param t a disposable object
   * @protected inherited classes should use this method to register disposables
   * @returns the disposable object
   */
  register(t) {
    this._settleLate(this._store.addOne(t));
    return t;
  }
  /**
   * Wait for the disposable and register it. If the current object is disposed in the meantime, the disposable is
   * disposed as soon as it arrives, and the returned promise still resolves with it.
   * @param promiseOrAction a disposable, a promise of one, or a function that returns either
   * @returns the disposable object
   */
  registerAsync(promiseOrAction) {
    return __async(this, null, function* () {
      const disposable = typeof promiseOrAction === "function" ? yield promiseOrAction() : yield promiseOrAction;
      return this.register(disposable);
    });
  }
  /**
   * Throw an exception if the object has been disposed.
   * @param message the message to include in the exception
   */
  throwIfDisposed(message) {
    this._store.throwIfDisposed(message);
  }
  /**
   * Start a timeout that is cleared when the object is disposed. It is released once it has fired.
   * @param callback a callback to call when the timeout expires
   * @param timeout the number of milliseconds to wait before calling the callback
   * @param options timer options
   * @returns the timeout; disposing it clears the timeout
   */
  addTimeout(callback, timeout, options) {
    return this._store.addTimeout(callback, timeout, options);
  }
  /**
   * Start an interval that is cleared when the object is disposed.
   * @param callback a callback to call when the interval expires
   * @param interval the number of milliseconds to wait between calls to the callback
   * @param options timer options
   * @returns the interval; disposing it clears the interval
   */
  addInterval(callback, interval, options) {
    return this._store.addInterval(callback, interval, options);
  }
  /**
   * Add a disposable, or a function (sync or async) to call on dispose. If the object has already been disposed, it is
   * disposed at once.
   * @param disposable a disposable to add
   */
  addDisposable(disposable) {
    this._settleLate(this._store.addOne(disposable));
  }
  /**
   * Add disposables. If the object has already been disposed, they are disposed at once.
   * @param disposables disposables to add
   */
  addDisposables(...disposables) {
    this._settleLate(this._store.addAll(disposables));
  }
  /**
   * Dispose everything registered, one after another. Every disposable is disposed even if some of them reject; the
   * errors go to the `onError` option, or reject the returned promise without it (several errors are wrapped in an
   * AggregateError). Calls made while the disposal is in progress return a promise that settles with it.
   */
  dispose() {
    const onError = this._onError;
    return onError === void 0 ? this._store.dispose() : this._store.disposeSafely(onError);
  }
  /**
   * Nobody awaits the disposal of something registered after the object was disposed, so its error goes to the
   * `onError` option, or to {@link safeDisposableExceptionHandlerManager} without it
   * @internal
   */
  _settleLate(disposal) {
    if (!(disposal instanceof Promise)) {
      return;
    }
    disposal.then(void 0, (e) => {
      const onError = this._onError;
      if (onError === void 0) {
        safeDisposableExceptionHandlerManager.handle(e);
      } else {
        onError(e);
      }
    });
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

// src/map-store-async.ts
var AsyncDisposableMapStore = class extends AsyncDisposiq {
  constructor() {
    super(...arguments);
    /**
     * @internal
     */
    this._map = /* @__PURE__ */ new Map();
    /**
     * Disposals of replaced or deleted values that are still in progress; they never reject
     * @internal
     */
    this._releasing = /* @__PURE__ */ new Set();
    /**
     * @internal
     */
    this._disposed = false;
  }
  /**
   * Returns true if the store has been disposed. It becomes true as soon as dispose is called, before the values have
   * finished disposing.
   */
  get disposed() {
    return this._disposed;
  }
  /**
   * The number of values in the store
   */
  get size() {
    return this._map.size;
  }
  /**
   * Get the value for the key
   * @param key the key
   * @returns the value or undefined if the key is not found
   */
  get(key) {
    return this._map.get(key);
  }
  /**
   * Check whether the store has a value for the key
   * @param key the key
   */
  has(key) {
    return this._map.has(key);
  }
  /**
   * The keys of the store, in insertion order
   */
  keys() {
    return this._map.keys();
  }
  /**
   * The values of the store, in insertion order
   */
  values() {
    return this._map.values();
  }
  /**
   * The key-value pairs of the store, in insertion order
   */
  entries() {
    return this._map.entries();
  }
  [Symbol.iterator]() {
    return this._map.entries();
  }
  /**
   * Set the value for the key. The value it replaces (unless it is the same value) is disposed. If the store is
   * disposed, the value is disposed instead.
   * @param key the key
   * @param value the value
   * @returns a promise that settles when the replaced (or rejected) value has been disposed, and rejects if that fails
   */
  set(key, value) {
    if (this._disposed) {
      return this._release(value);
    }
    const prev = this._map.get(key);
    this._map.set(key, value);
    return prev === void 0 || prev === value ? resolvedPromise : this._release(prev);
  }
  /**
   * Delete the value for the key and dispose it
   * @param key the key
   * @returns a promise that resolves with true once the value has been disposed, or with false if the key is not
   * found; it rejects if the disposal fails
   */
  delete(key) {
    return __async(this, null, function* () {
      const value = this._map.get(key);
      if (value === void 0) {
        return false;
      }
      this._map.delete(key);
      yield this._release(value);
      return true;
    });
  }
  /**
   * Remove the value for the key and return it. The value is not disposed
   * @param key the key
   * @returns the value or undefined if the key is not found
   */
  extract(key) {
    const value = this._map.get(key);
    if (value === void 0) {
      return void 0;
    }
    this._map.delete(key);
    return value;
  }
  /**
   * Dispose the store and every value, in insertion order, after the disposals of replaced or deleted values that are
   * already in progress. Every value is disposed even if some of them reject; the returned promise then rejects with
   * the error (several errors are wrapped in an AggregateError). Calls made while the disposal is in progress return
   * the same promise, later calls resolve immediately.
   */
  dispose() {
    var _a;
    if (this._disposed) {
      return (_a = this._disposing) != null ? _a : resolvedPromise;
    }
    this._disposed = true;
    const values = Array.from(this._map.values());
    this._map.clear();
    const running = Array.from(this._releasing);
    const disposing = onSettled(
      Promise.all(running).then(() => justDisposeAllAsync(values)),
      () => {
        this._disposing = void 0;
      }
    );
    this._disposing = disposing;
    return disposing;
  }
  /**
   * @internal
   */
  _release(value) {
    const release = justDisposeAsync(value);
    const settled = release.then(noop, noop);
    this._releasing.add(settled);
    settled.then(() => {
      this._releasing.delete(settled);
    });
    return release;
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
    return result.then(
      (r) => runDispose(resource, () => r),
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
export {
  AbortDisposable,
  SafeActionDisposable as ActionSafeDisposable,
  SafeAsyncActionDisposable as AsyncActionSafeDisposable,
  AsyncDisposable,
  AsyncDisposableAction,
  AsyncDisposableContainer,
  AsyncDisposableMapStore,
  AsyncDisposableStore,
  AsyncDisposiq,
  AsyncDisposiq as BaseAsyncDisposable,
  Disposiq as BaseDisposable,
  BoolDisposable,
  BoolDisposable as BooleanDisposable,
  CancellationToken,
  CancellationTokenDisposable,
  AsyncDisposableStore as CompositeAsyncDisposable,
  DisposableStore as CompositeDisposable,
  Disposable,
  DisposableAction,
  DisposableContainer,
  DisposableMapStore as DisposableDictionary,
  DisposableMapStore,
  DisposableStore,
  Disposiq,
  IntervalDisposable,
  ObjectDisposedException,
  OperationCancelledException,
  SafeActionDisposable,
  SafeAsyncActionDisposable,
  DisposableContainer as SerialDisposable,
  TimeoutDisposable,
  WeakRefDisposable,
  addEventListener,
  disposableFromCancellationToken as createCancellationTokenDisposable,
  createDisposable,
  createDisposableCompat,
  createDisposiq,
  disposableFromCancellationToken,
  disposableFromEvent,
  disposableFromEventOnce,
  disposeAll,
  disposeAllAsync,
  disposeAll as disposeAllSafe,
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
  mergeTokens,
  disposableFromEvent as on,
  onCancel,
  disposableFromEventOnce as once,
  safeDisposableExceptionHandlerManager,
  timeoutToken,
  createDisposable as toDisposable,
  createDisposableCompat as toDisposableCompat,
  createDisposiq as toDisposiq,
  using
};
