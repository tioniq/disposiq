/**
 * A disposable interface. Uses 'IDisposable' as a name to avoid conflicts with the global 'Disposable' class.
 */
interface IDisposable {
    dispose(): void;
}
/**
 * An async disposable interface. Uses 'IAsyncDisposable' as a name to avoid conflicts with the global 'AsyncDisposable' class.
 */
interface IAsyncDisposable {
    dispose(): Promise<void>;
}
/**
 * A function that disposes a resource.
 */
type DisposeFunc = () => void;
/**
 * A disposable object or a function that disposes a resource.
 */
type DisposableLike = IDisposable | DisposeFunc;
/**
 * A function that disposes a resource asynchronously.
 */
type AsyncDisposeFunc = () => Promise<void>;
/**
 * An async disposable object or a function that disposes a resource asynchronously.
 */
type AsyncDisposableLike = IAsyncDisposable | AsyncDisposeFunc;
/**
 * The order in which a container disposes its items: `fifo` in the order they were added, `lifo` in reverse
 * (like the 'using' keyword and `DisposableStack`).
 */
type DisposalOrder = "fifo" | "lifo";
/**
 * Represents an interface that provides a mechanism to signal and handle cancellation requests.
 * The interface requires that the `cancel` method be called to request cancellation. All other methods and properties
 * are optional
 */
interface CancellationTokenLike {
    /**
     * Cancels the current operation or action, stopping any ongoing processes or tasks.
     */
    cancel(): void;
    /**
     * Gets a value that indicates whether the operation has been cancelled. Can be a boolean value or a function that
     * returns a boolean value.
     */
    isCancelled?: boolean | (() => boolean);
    /**
     * Throws an exception if the operation has been cancelled.
     */
    throwIfCancelled?(): void;
    /**
     * Registers a callback that will be called when the operation is cancelled.
     * @param callback the callback to call when the operation is cancelled
     */
    onCancel?(callback: () => void): void;
    /**
     * Removes a callback that was previously registered with the `onCancel` method.
     * @param callback the callback to remove
     */
    removeCallback?(callback: () => void): void;
}
/**
 * A disposable object that is possible to dispose
 */
type CanBeDisposable = DisposableLike | Disposable | AsyncDisposable | AbortController | CancellationTokenLike | {
    unref(): void;
};
/**
 * A container interface for disposables collection. Implementation is {@link DisposableStore}.
 */
interface IDisposablesContainer extends DisposableAware {
    /**
     * Returns true if the container is disposed.
     */
    get disposed(): boolean;
    /**
     * Adds disposables to the container.
     * @param disposables Disposables to add.
     */
    add(...disposables: DisposableLike[]): void;
    /**
     * Adds disposables to the container.
     * @param disposables Disposables to add.
     */
    add(disposables: DisposableLike[]): void;
    /**
     * Adds disposables to the container.
     * @param disposables Disposables to add.
     */
    addAll(disposables: DisposableLike[]): void;
    /**
     * Adds a disposable to the container
     * @param disposable Disposable to add
     */
    addOne(disposable: DisposableLike): void;
    /**
     * Removes a disposable from the container.
     * @param disposable Disposable to remove.
     * @returns `true` if the disposable was removed, `false` otherwise.
     */
    remove(disposable: DisposableLike): boolean;
    /**
     * Disposes all disposables in the container. The container becomes disposed.
     */
    disposeCurrent(): void;
    /**
     * Disposes all disposables in the container safely. The container becomes disposed.
     */
    disposeSafely(onErrorCallback?: (e: unknown) => void): void;
}
/**
 * An interface for a disposable that can be checked for disposal status.
 */
interface DisposableAware extends IDisposable {
    /**
     * Returns true if the object is disposed.
     */
    get disposed(): boolean;
}
/**
 * A compatibility interface for IDisposable interface and global Disposable API
 */
interface DisposableCompat extends IDisposable, Disposable {
}
/**
 * A compatibility interface for DisposableAware interface and global Disposable API
 */
interface DisposableAwareCompat extends DisposableAware, DisposableCompat {
}
/**
 * An interface for an async disposable that can be checked for disposal status.
 */
interface AsyncDisposableAware extends IAsyncDisposable {
    /**
     * Returns true if the object is disposed.
     */
    get disposed(): boolean;
}
/**
 * A compatibility interface for IAsyncDisposable interface and global Disposable API
 */
interface AsyncDisposableCompat extends IAsyncDisposable, AsyncDisposable {
}
/**
 * A compatibility interface for AsyncDisposableAware interface and global Disposable API
 */
interface AsyncDisposableAwareCompat extends AsyncDisposableAware, AsyncDisposableCompat {
}

/**
 * Options for the timers created by the library
 */
interface TimerOptions {
    /**
     * The timer does not keep the process alive. Applies where the timer handle has an `unref` method (Node.js, Bun,
     * Deno); ignored elsewhere.
     */
    unref?: boolean;
}
/**
 * A pending timeout. Disposing it clears the timeout.
 * @example
 * const timeout = new TimeoutDisposable(() => console.log("fired"), 1000, { unref: true })
 * timeout.dispose() // the callback is never called
 */
declare class TimeoutDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(callback: () => void, ms: number, options?: TimerOptions);
    /**
     * Returns true once the timeout has fired or has been disposed
     */
    get disposed(): boolean;
    /**
     * Returns true if the callback has been called
     */
    get fired(): boolean;
    /**
     * Let the process exit while the timeout is pending (where the platform supports it)
     */
    unref(): this;
    /**
     * Keep the process alive while the timeout is pending (the default)
     */
    ref(): this;
    dispose(): void;
}
/**
 * A running interval. Disposing it clears the interval.
 */
declare class IntervalDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(callback: () => void, ms: number, options?: TimerOptions);
    /**
     * Returns true if the interval has been disposed
     */
    get disposed(): boolean;
    /**
     * Let the process exit while the interval is running (where the platform supports it)
     */
    unref(): this;
    /**
     * Keep the process alive while the interval is running (the default)
     */
    ref(): this;
    dispose(): void;
}

/**
 * Options of a disposable store
 */
interface DisposableStoreOptions {
    /**
     * The order in which the store disposes its items. Defaults to `fifo`, the order they were added.
     */
    order?: DisposalOrder;
}
/**
 * DisposableStore is a container for disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
declare class DisposableStore extends Disposiq implements IDisposablesContainer, DisposableAwareCompat {
    /**
     * The order in which the store disposes its items
     */
    readonly order: DisposalOrder;
    constructor(options?: DisposableStoreOptions);
    /**
     * Returns true if the object has been disposed.
     */
    get disposed(): boolean;
    add(...disposables: (DisposableLike | null | undefined)[]): void;
    add(disposables: (DisposableLike | null | undefined)[]): void;
    /**
     * Add multiple disposables to the store. If the store has already been disposed, the disposables will be disposed.
     * @param disposables an array of disposables to add
     */
    addAll(disposables: (DisposableLike | null | undefined)[]): void;
    /**
     * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
     * @param disposable a disposable to add
     * @returns the disposable object
     */
    addOne(disposable: DisposableLike | null | undefined): void;
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
    addOneSafe(disposable: DisposableLike | null | undefined, onError?: (error: unknown) => void): void;
    /**
     * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
     * @param disposable a disposable to remove
     * @returns true if the disposable was found and removed
     */
    remove(disposable: DisposableLike | null | undefined): boolean;
    /**
     * Add a timeout to the store. The store clears it when disposed, and it leaves the store once it has fired. If the
     * store has already been disposed, the callback is never called.
     * @param callback a callback to call when the timeout expires
     * @param timeout the number of milliseconds to wait before calling the callback
     * @param options timer options
     * @returns the timeout; disposing it clears the timeout
     */
    addTimeout(callback: () => void, timeout: number, options?: TimerOptions): TimeoutDisposable;
    /**
     * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
     * @param timeout a timeout handle
     */
    addTimeout(timeout: ReturnType<typeof setTimeout> | number): void;
    /**
     * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
     * @param callback a callback to call when the interval expires
     * @param interval the number of milliseconds to wait between calls to the callback
     * @param options timer options
     * @returns the interval; disposing it clears the interval
     */
    addInterval(callback: () => void, interval: number, options?: TimerOptions): IntervalDisposable;
    /**
     * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
     * @param interval an interval handle
     */
    addInterval(interval: ReturnType<typeof setInterval> | number): void;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     */
    throwIfDisposed(message?: string): void;
    use<T extends DisposableLike>(supplier: () => T): T;
    use<T extends DisposableLike>(supplier: () => Promise<T>): Promise<T>;
    use<T extends DisposableLike>(supplier: () => T | Promise<T>): T | Promise<T>;
    /**
     * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
     * store. The store can continue to be used after this method is called. This method is useful when the store is
     * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
     * this method will safely add the disposable to the store without disposing it immediately.
     */
    disposeCurrent(): void;
    /**
     * Dispose all disposables in the store like {@link disposeCurrent}, passing each error to the callback instead of
     * throwing. The store does not become disposed.
     * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
     */
    disposeCurrentSafely(onErrorCallback?: (e: unknown) => void): void;
    /**
     * Dispose the store and all disposables safely. If an error occurs during disposal, the error is caught and
     * passed to the onErrorCallback.
     */
    disposeSafely(onErrorCallback?: (e: unknown) => void): void;
    /**
     * Dispose the store and all disposables in the store's {@link order}. Every disposable is disposed even if some of
     * them throw; the error is rethrown afterwards (several errors are wrapped in an AggregateError).
     */
    dispose(): void;
    /**
     * Create a disposable store from an array of values. The values are mapped to disposables using the provided
     * mapper function.
     * @param values an array of values
     * @param mapper a function that maps a value to a disposable
     */
    static from<T>(values: T[], mapper: (value: T) => DisposableLike): DisposableStore;
    /**
     * Create a disposable store from an array of disposables.
     * @param disposables an array of disposables
     * @returns a disposable store containing the disposables
     */
    static from(disposables: (DisposableLike | null | undefined)[]): DisposableStore;
}

/**
 * Options of a {@link Disposable}
 */
type DisposableOptions = DisposableStoreOptions;
/**
 * Disposable is a base class for disposables. It will dispose all added disposables when it is disposed.
 */
declare abstract class Disposable$1 extends Disposiq implements DisposableCompat {
    /**
     * @param options the order in which the registered disposables are disposed; `fifo` by default
     */
    constructor(options?: DisposableOptions);
    /**
     * Returns true if the object has been disposed.
     */
    protected get disposed(): boolean;
    /**
     * Register a disposable object. The object will be disposed when the current object is disposed.
     * @param t a disposable object
     * @protected inherited classes should use this method to register disposables
     * @returns the disposable object
     */
    protected register<T extends IDisposable>(t: T): T;
    protected registerAsync<T extends IDisposable>(promiseOrAction: Promise<T> | (() => Promise<T>) | (() => T) | T): Promise<T>;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     * @protected inherited classes can use this method to throw an exception if the object has been disposed
     */
    protected throwIfDisposed(message?: string): void;
    /**
     * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
     * @param disposable a disposable to add
     */
    addDisposable(disposable: DisposableLike): void;
    /**
     * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
     * @param disposables disposables to add
     */
    addDisposables(...disposables: DisposableLike[]): void;
    dispose(): void;
}

/**
 * Disposiq is a base class for disposables. The only reason is to have ability to extend it with additional functionality.
 */
declare abstract class Disposiq implements DisposableCompat {
    /**
     * Dispose the object. If the object has already been disposed, this should be a no-op
     */
    abstract dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}
interface Disposiq {
    /**
     * Dispose the object when the container is disposed.
     * @param container a container to add the disposable to
     */
    disposeWith(container: IDisposablesContainer | Disposable$1): void;
    /**
     * Dispose the object after a specified time.
     * @param ms time in milliseconds
     */
    disposeIn(ms: number): void;
    /**
     * Convert the object to a function that disposes the object.
     */
    toFunction(): () => void;
    /**
     * Convert the object to a plain object with a dispose method.
     */
    toPlainObject(): IDisposable;
    /**
     * Embeds the current object to extend its functionality by combining
     * its properties and behaviors with the IDisposable type. This method
     * modifies the current object to include the dispose method.
     *
     * @param {T} obj - The object to be embedded with the IDisposable type.
     * @template T - The type of the current object.
     * @return {T & IDisposable} - The `obj` object with the dispose method added.
     */
    embedTo<T extends object>(obj: T): T & IDisposable;
    /**
     * Converts the object to a safe disposable object that catches errors during disposal.
     * Optionally, an error callback can be supplied to handle any errors that occur.
     *
     * @param [errorCallback] An optional callback function that handles errors. The function receives the error
     * as its parameter.
     * @return {Disposiq} A safe version of the current instance ensuring error resilience.
     */
    toSafe(errorCallback?: (e: unknown) => void): Disposiq;
}
/**
 * AsyncDisposiq is a base class for disposables that can be disposed asynchronously.
 */
declare abstract class AsyncDisposiq extends Disposiq {
    /**
     * Dispose the object in async way. Should return the Promise. If the object has already been disposed, this should
     * be a no-op
     */
    abstract dispose(): Promise<void>;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.asyncDispose](): Promise<void>;
}
interface AsyncDisposiq {
    /**
     * Converts the current instance to a safe version, suppressing potential errors during execution.
     * Optionally, an error callback can be supplied to handle any errors that occur.
     *
     * @param [errorCallback] An optional callback function that handles errors. The function receives the error
     * as its parameter.
     * @return {AsyncDisposiq} A safe version of the current instance ensuring error resilience.
     */
    toSafe(errorCallback?: (e: unknown) => void): AsyncDisposiq;
}

/**
 * Disposable container for AbortController. It will abort the signal when it is disposed.
 */
declare class AbortDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(controller?: AbortController);
    /**
     * Returns true if the signal is aborted
     */
    get disposed(): boolean;
    /**
     * Returns the signal of the AbortController
     */
    get signal(): AbortSignal;
    dispose(): void;
}

/**
 * Represents an action that can be disposed. The action is invoked when the action is disposed.
 * The action is only invoked once.
 * @example
 * const action = new DisposableAction(() => {
 *    console.log("disposed")
 * })
 * action.dispose() // disposed
 * action.dispose() // no-op
 */
declare class DisposableAction extends Disposiq implements DisposableAwareCompat {
    constructor(action: DisposeFunc);
    /**
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    /**
     * Dispose the action. If the action has already been disposed, this is a
     * no-op.
     * If the action has not been disposed, the action is invoked and the action
     * is marked as disposed.
     */
    dispose(): void;
}
/**
 * Represents an async action that can be disposed. The action is invoked when the action is disposed.
 * The action is only invoked once.
 * @example
 * const action = new AsyncDisposableAction(async () => {
 *    console.log("disposed")
 * })
 * await action.dispose() // disposed
 * await action.dispose() // no-op
 */
declare class AsyncDisposableAction extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    constructor(action: () => Promise<void> | void);
    /**
     * Returns true if the action has been disposed. It becomes true as soon as dispose is called, before the action
     * has completed.
     */
    get disposed(): boolean;
    /**
     * Dispose the action. The action is invoked once; calls made while it is running return the same promise (which
     * rejects if the action fails), later calls resolve immediately.
     */
    dispose(): Promise<void>;
}

/**
 * Class of a disposable that can be checked for disposal status.
 */
declare class BoolDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(disposed?: boolean);
    /**
     * Returns true if the disposable is disposed
     */
    get disposed(): boolean;
    dispose(): void;
}

/**
 * Converts a cancellation token into a disposable object that can be used
 * to manage and respond to cancellation requests.
 *
 * @param {CancellationTokenLike} token - The cancellation token to be wrapped
 * into a disposable instance.
 * @return {Disposiq & DisposableAware} A disposable object that represents
 * the behavior associated with the provided cancellation token.
 */
declare function disposableFromCancellationToken(token: CancellationTokenLike): Disposiq & DisposableAware;
/**
 * Represents a disposable object that manages cancellation token.
 * This class provides an abstraction for working with cancellation tokens
 * and exposes a mechanism to track if it has been disposed.
 * Implements the DisposableAware interface.
 */
declare class CancellationTokenDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(token: CancellationTokenLike);
    get disposed(): boolean;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     */
    throwIfDisposed(message?: string): void;
    dispose(): void;
}
/**
 * A cancellation token: `cancel()` marks it cancelled and calls the callbacks registered with `onCancel`.
 * Disposing a token does not cancel it: it detaches the token from what would cancel it on its own (the timer of
 * {@link timeoutToken}, the parents of {@link mergeTokens}), so `using` releases them at the end of a scope. Use
 * {@link disposableFromCancellationToken} for a disposable that cancels the token.
 * @example
 * using deadline = timeoutToken(30_000)
 * await download(url, deadline)
 */
declare class CancellationToken extends Disposiq implements CancellationTokenLike {
    /**
     * Create a token that is cancelled after the given time. Disposing the token clears the timer without cancelling
     * it. An error thrown by a callback when the timer fires goes to {@link safeDisposableExceptionHandlerManager}.
     * @param ms the time in milliseconds
     * @param options timer options
     */
    static timeout(ms: number, options?: TimerOptions): CancellationToken;
    /**
     * Create a token that is cancelled when any of the given tokens is cancelled, or by its own `cancel()`. It is
     * created cancelled if one of them is already cancelled. Disposing it unsubscribes it from the given tokens without
     * cancelling it. Tokens without an `onCancel` method are only checked once, when the token is created.
     * @param tokens the tokens to follow; null and undefined are skipped
     */
    static merge(...tokens: (CancellationTokenLike | null | undefined)[]): CancellationToken;
    /**
     * Returns true if the token has been cancelled
     */
    isCancelled(): boolean;
    /**
     * Throw an {@link OperationCancelledException} if the token has been cancelled
     * @param message the message to include in the exception
     */
    throwIfCancelled(message?: string): void;
    /**
     * Register a callback to call when the token is cancelled. On a cancelled token the callback is called at once.
     * @param callback the callback
     * @returns a disposable that unregisters the callback
     */
    onCancel(callback: () => void): Disposiq;
    /**
     * Unregister a callback registered with `onCancel`
     * @param callback the callback
     */
    removeCallback(callback: () => void): void;
    /**
     * Cancel the token and call the registered callbacks in the order they were registered. Every callback is called
     * even if some of them throw; the error is rethrown afterwards (several errors are wrapped in an AggregateError).
     * Cancelling more than once is a no-op.
     */
    cancel(): void;
    /**
     * Detach the token from its timer or parent tokens without cancelling it. The token keeps its state and its
     * callbacks, and `cancel()` still works.
     */
    dispose(): void;
}
/**
 * Create a token that is cancelled after the given time. Disposing the token clears the timer without cancelling it,
 * so `using deadline = timeoutToken(ms)` leaves no timer behind at the end of the scope.
 * @param ms the time in milliseconds
 * @param options timer options
 */
declare function timeoutToken(ms: number, options?: TimerOptions): CancellationToken;
/**
 * Create a token that is cancelled when any of the given tokens is cancelled, or by its own `cancel()`. Disposing it
 * unsubscribes it from the given tokens without cancelling it.
 * @param tokens the tokens to follow; null and undefined are skipped
 */
declare function mergeTokens(...tokens: (CancellationTokenLike | null | undefined)[]): CancellationToken;
/**
 * Register a callback with any token that has an `onCancel` method, and return a disposable that unregisters it.
 * After disposal the callback is never called, even by a token that cannot unregister callbacks. Whether a token that
 * is already cancelled calls the callback is up to the token.
 * @param token the token
 * @param callback the callback to call when the token is cancelled
 * @returns a disposable that unregisters the callback
 */
declare function onCancel(token: CancellationTokenLike & Required<Pick<CancellationTokenLike, "onCancel">>, callback: () => void): Disposiq;

/**
 * A container for a disposable object. It can be replaced with another disposable object.
 * When disposed, it will dispose the current disposable object and all future disposable objects
 * @example
 * const container = new DisposableContainer()
 * container.set(createDisposable(() => console.log("disposed")))
 * container.dispose() // disposed
 * container.set(createDisposable(() => console.log("disposed again"))) // disposed again
 */
declare class DisposableContainer extends Disposiq implements DisposableAwareCompat {
    constructor(disposable?: CanBeDisposable | null | undefined);
    /**
     * Returns true if the container is disposed
     */
    get disposed(): boolean;
    /**
     * Returns the current disposable object
     */
    get disposable(): IDisposable | undefined;
    /**
     * Set the new disposable and dispose the old one. Setting the current disposable again does not dispose it
     * @param disposable a new disposable to set
     */
    set(disposable: CanBeDisposable | null | undefined): void;
    /**
     * Replace the disposable with a new one. Does not dispose the old one
     * @param disposable a new disposable to replace the old one
     * @returns the old disposable object or undefined if the container is disposed.
     */
    replace(disposable: CanBeDisposable | null | undefined): IDisposable | undefined;
    /**
     * Dispose only the current disposable object without affecting the container's state.
     */
    disposeCurrent(): void;
    dispose(): void;
}

/**
 * Create a disposable from a disposable like object. The object can be a function, an object with a dispose method,
 * an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method.
 * @param disposableLike a disposable like object
 * @returns a disposable object. If the input is already a disposable object, it will be returned as is.
 * If the input is a function, it will be wrapped in a DisposableAction object.
 * If the input has internal Symbol.dispose/Symbol.asyncDispose method, it will be wrapped in a DisposableAction object.
 * If the input is an AbortController, it will be wrapped in an AbortDisposable object.
 * If the input is invalid, an empty disposable object will be returned.
 */
declare function createDisposable(disposableLike: CanBeDisposable | null | undefined): IDisposable;
/**
 * Create a system-compatible disposable from a disposable like object. The object can be a function, an object with a dispose method,
 * an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method. This function is used to create
 * a disposable object that is compatible with the system's internal disposable object
 * @param disposableLike a disposable like object
 * @returns a disposable object. If the input is already a disposable object with Symbol.dispose/Symbol.asyncDispose, it will be returned as is.
 * If the input is a function, it will be wrapped in a DisposableAction object.
 * If the input has internal Symbol.dispose/Symbol.asyncDispose method, it will be wrapped in a DisposableAction object.
 * If the input is an AbortController, it will be wrapped in an AbortDisposable object.
 * If the input is invalid, an empty disposable object will be returned.
 */
declare function createDisposableCompat(disposableLike: CanBeDisposable | null | undefined): DisposableCompat;
/**
 * Create a Disposiq-inherited object from a disposable like object. The object can be a function, an object with a
 * dispose method, an AbortController, or an object with an internal Symbol.dispose/Symbol.asyncDispose method. This
 * function is used to create a Disposiq instance that is compatible with all extensions of Disposiq
 * @param disposableLike a disposable like object
 * @returns a Disposiq object. If the input is already a Disposiq object, it will be returned as is.
 */
declare function createDisposiq(disposableLike: CanBeDisposable | null | undefined): Disposiq;

/**
 * Dispose a disposable object or call a dispose function
 * @param disposable a disposable object or a dispose function. Can be null or undefined - no-op
 */
declare function justDispose(disposable: DisposableLike | null | undefined): void;
/**
 * Dispose a disposable object or call a dispose function
 * @param disposable a disposable object or a dispose function. Can be null or undefined - no-op
 * @param onError a callback to handle errors
 */
declare function justDisposeSafe(disposable: DisposableLike | null | undefined, onError?: (error: unknown) => void): void;
/**
 * Dispose an async disposable object or call an async dispose function
 * @param disposable an async disposable object or an async dispose function. Can be null or undefined - no-op
 * @returns a promise that resolves when the disposal is complete
 */
declare function justDisposeAsync(disposable: DisposableLike | AsyncDisposableLike | null | undefined): Promise<void>;
/**
 * Dispose all disposables in the array. Will check each item for null or undefined. Every item is disposed even if
 * some of them throw; then the error is rethrown (several errors are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
declare function justDisposeAll(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array. Will check each item for null or undefined. Every item is disposed even
 * if some of them reject; then the promise rejects (several errors are wrapped in an AggregateError)
 * @param disposables an array of disposables
 * @returns a promise that resolves when all disposals are complete
 */
declare function justDisposeAllAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify.
 * Every item is disposed even if some of them throw; then the error is rethrown (several errors are wrapped in an
 * AggregateError)
 * @param disposables an array of disposables
 */
declare function disposeAll(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array safely. During the disposal process, the array is safe to modify.
 * Every item is disposed even if some of them reject; then the promise rejects (several errors are wrapped in an
 * AggregateError)
 * @param disposables an array of disposables
 */
declare function disposeAllAsync(disposables: (DisposableLike | AsyncDisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify.
 * Every item is disposed even if some of them throw; the array is cleared, then the error is rethrown (several errors
 * are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
declare function disposeAllUnsafe(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array unsafely. During the disposal process, the array is not safe to modify.
 * Every item is disposed even if some of them reject; the array is cleared, then the promise rejects (several errors
 * are wrapped in an AggregateError)
 * @param disposables an array of disposables
 */
declare function disposeAllUnsafeAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array safely: an error is passed to onErrorCallback and the remaining items are still
 * disposed. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
declare function disposeAllSafely(disposables: (DisposableLike | null | undefined)[], onErrorCallback?: (error: unknown) => void): void;
/**
 * Dispose all disposables in the array safely: an error is passed to onErrorCallback and the remaining items are still
 * disposed. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
declare function disposeAllSafelyAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[], onErrorCallback?: (error: unknown) => void): Promise<void>;

/**
 * Any function can be a listener; the functions below keep the listener's own type
 */
type EventListenerLike = (...args: never[]) => unknown;
interface EventEmitterLike<K extends string | symbol, L extends EventListenerLike> {
    on(event: K, listener: L): unknown;
    off(event: K, listener: L): unknown;
    once?(event: K, listener: L): unknown;
}
/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener. Its parameter types are kept, e.g. `(code: number) => void`
 * @returns a disposable object
 * @remarks Event names are not inferred from the emitter's type: any string or symbol is accepted
 */
declare function disposableFromEvent<K extends string | symbol, L extends EventListenerLike = (...args: unknown[]) => void>(emitter: EventEmitterLike<K, L>, event: K, listener: L): Disposiq & DisposableAwareCompat;
/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * The listener will only be called once. An emitter without `once` is supported: the listener is added with `on` and
 * removed before its first call.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener. Its parameter types are kept, e.g. `(code: number) => void`
 * @returns a disposable object
 */
declare function disposableFromEventOnce<K extends string | symbol, L extends EventListenerLike = (...args: unknown[]) => void>(emitter: EventEmitterLike<K, L>, event: K, listener: L): Disposiq & DisposableAwareCompat;

/**
 * A key-value store that stores disposable values. When the store is disposed, all the values will be disposed as well
 * @typeParam K the key type
 * @typeParam V the value type. With the default `IDisposable`, `set` accepts anything disposable-like (functions,
 * AbortControllers, ...) and stores it converted to an `IDisposable`; with a narrower type, `set` accepts and `get`
 * returns exactly that type
 */
declare class DisposableMapStore<K, V extends IDisposable = IDisposable> extends Disposiq implements DisposableAware, Iterable<[K, V]> {
    /**
     * Get the disposed state of the store
     */
    get disposed(): boolean;
    /**
     * The number of values in the store
     */
    get size(): number;
    /**
     * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed
     * (unless it is the same value).
     * If the store is disposed, the value will be disposed immediately
     * @param key the key
     * @param value the disposable value
     */
    set(key: K, value: IDisposable extends V ? CanBeDisposable : V): void;
    /**
     * Get the disposable value for the key
     * @param key the key
     * @returns the disposable value or undefined if the key is not found
     */
    get(key: K): V | undefined;
    /**
     * Check whether the store has a value for the key
     * @param key the key
     */
    has(key: K): boolean;
    /**
     * The keys of the store, in insertion order
     */
    keys(): IterableIterator<K>;
    /**
     * The values of the store, in insertion order
     */
    values(): IterableIterator<V>;
    /**
     * The key-value pairs of the store, in insertion order
     */
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    /**
     * Delete the disposable value for the key
     * @param key the key
     * @returns true if the key was found and the value was deleted, false otherwise
     */
    delete(key: K): boolean;
    /**
     * Remove the disposable value for the key and return it. The disposable value will not be disposed
     * @param key the key
     * @returns the disposable value or undefined if the key is not found
     */
    extract(key: K): V | undefined;
    dispose(): void;
}

type ExceptionHandler = (error: unknown) => void;
/**
 * Exception handler manager
 */
declare class ExceptionHandlerManager {
    /**
     * Create a new ExceptionHandlerManager with the default handler
     * @param defaultHandler the default handler. If not provided, the default handler will be a no-op
     */
    constructor(defaultHandler?: ExceptionHandler | null);
    /**
     * Get the handler for the manager
     */
    get handler(): ExceptionHandler;
    /**
     * Set the handler for the manager
     */
    set handler(value: ExceptionHandler | undefined | null);
    /**
     * Reset the handler to the default handler
     */
    reset(): void;
    /**
     * Handle an exception
     * @param error the exception to handle
     */
    handle(error: unknown): void;
    /**
     * Handle an exception safely
     * @param error the exception to handle
     */
    handleSafe(error: Error): void;
}

/**
 * A variable that manages exception handling for safe disposable objects.
 *
 * The `safeDisposableExceptionHandlerManager` is an instance of
 * the `ExceptionHandlerManager` class. It is designed to handle the
 * registration, management, and execution of exception handlers,
 * ensuring robust error management in systems involving disposable
 * resources.
 */
declare const safeDisposableExceptionHandlerManager: ExceptionHandlerManager;
/**
 * Represents a safe action that can be disposed. The action is invoked when the action is disposed.
 */
declare class SafeActionDisposable extends Disposiq implements DisposableAwareCompat {
    constructor(action: () => void);
    /**
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    dispose(): void;
}
/**
 * Represents a safe async action that can be disposed. The action is invoked when the action is disposed.
 */
declare class SafeAsyncActionDisposable extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    constructor(action: () => Promise<void>);
    /**
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    /**
     * Dispose the action. If the action has already been disposed, this is a no-op. Calls made while the action is
     * running return a promise that settles when it completes.
     */
    dispose(): Promise<void>;
}

/**
 * Options of an async disposable store
 */
interface AsyncDisposableStoreOptions extends DisposableStoreOptions {
    /**
     * When true, disposals never overlap: each `disposeCurrent` starts after the previous one has finished (and its
     * promise settles after that), and `dispose` waits for a `disposeCurrent` in progress. Defaults to false.
     * An item must not await a `disposeCurrent` or `dispose` of its own serial store while it is being disposed: that
     * call waits for the disposal the item is part of.
     */
    serial?: boolean;
}
/**
 * AsyncDisposableStore is a container for async disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
declare class AsyncDisposableStore extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    /**
     * The order in which the store disposes its items
     */
    readonly order: DisposalOrder;
    /**
     * Whether disposals wait for the ones started before them, see {@link AsyncDisposableStoreOptions.serial}
     */
    readonly serial: boolean;
    constructor(options?: AsyncDisposableStoreOptions);
    /**
     * Returns true if the object has been disposed. It becomes true as soon as dispose or disposeSafely is called,
     * before the disposables have finished disposing.
     */
    get disposed(): boolean;
    add(...disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): void;
    add(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): void;
    addAll(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): void | Promise<void>;
    /**
     * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
     * @param disposable a disposable to add
     * @returns void if the container has not been disposed, otherwise a promise that resolves when the disposable has been disposed
     */
    addOne(disposable: AsyncDisposableLike | DisposableLike | null | undefined): void | Promise<void>;
    /**
     * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
     * @param disposable the disposable to remove
     * @returns true if the disposable was removed, false otherwise
     */
    remove(disposable: AsyncDisposableLike | DisposableLike | null | undefined): boolean;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     */
    throwIfDisposed(message?: string): void;
    /**
     * Add a timeout to the store. The store clears it when disposed, and it leaves the store once it has fired. If the
     * store has already been disposed, the callback is never called.
     * @param callback a callback to call when the timeout expires
     * @param timeout the number of milliseconds to wait before calling the callback
     * @param options timer options
     * @returns the timeout; disposing it clears the timeout
     */
    addTimeout(callback: () => void, timeout: number, options?: TimerOptions): TimeoutDisposable;
    /**
     * Add an interval to the store. The store clears it when disposed. If the store has already been disposed, the
     * interval is cleared at once.
     * @param callback a callback to call when the interval expires
     * @param interval the number of milliseconds to wait between calls to the callback
     * @param options timer options
     * @returns the interval; disposing it clears the interval
     */
    addInterval(callback: () => void, interval: number, options?: TimerOptions): IntervalDisposable;
    /**
     * Dispose all disposables in the store. The store does not become disposed. Every disposable is disposed even if
     * some of them reject; the returned promise then rejects with the error (several errors are wrapped in an
     * AggregateError). On a serial store the round starts after the previous one has finished, and on a disposed
     * serial store the returned promise settles when the disposal has finished.
     */
    disposeCurrent(): Promise<void>;
    /**
     * Dispose all disposables in the store like {@link disposeCurrent}, passing each error to the callback instead of
     * rejecting. The store does not become disposed.
     * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
     */
    disposeCurrentSafely(onErrorCallback?: (e: unknown) => void): Promise<void>;
    /**
     * Dispose all disposables in the store safely. The store becomes disposed immediately. Errors are passed to the
     * callback and never reject the returned promise. If a disposal is already in progress, the returned promise
     * settles when it completes.
     * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
     */
    disposeSafely(onErrorCallback?: (e: unknown) => void): Promise<void>;
    /**
     * Dispose the store and all disposables in the store's {@link order}. The store becomes disposed immediately. Every
     * disposable is disposed even if some of them reject; the returned promise then rejects with the error (several
     * errors are wrapped in an AggregateError). Calls made while the disposal is in progress return the same promise,
     * later calls resolve immediately. On a serial store the disposal starts after a `disposeCurrent` in progress.
     */
    dispose(): Promise<void>;
    /**
     * Create an async disposable store from an array of values. The values are mapped to disposables using the provided
     * mapper function.
     * @param values an array of values
     * @param mapper a function that maps a value to a disposable
     */
    static from<T>(values: T[], mapper: (value: T) => AsyncDisposableLike | DisposableLike | null | undefined): AsyncDisposableStore;
    /**
     * Create an async disposable store from an array of disposables.
     * @param disposables an array of disposables
     * @returns a disposable store containing the disposables
     */
    static from(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): AsyncDisposableStore;
}

/**
 * A container for a disposable that is disposed asynchronously: the async counterpart of {@link DisposableContainer}.
 * Setting a new value disposes the previous one, and the returned promise settles when that disposal has finished.
 * @typeParam T the value type
 * @example
 * const connection = new AsyncDisposableContainer<Connection>()
 * await connection.set(await Connection.open()) // closes the previous connection, if any
 * await connection.dispose() // closes the current one
 */
declare class AsyncDisposableContainer<T extends IAsyncDisposable | IDisposable = IAsyncDisposable | IDisposable> extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    constructor(disposable?: T | null | undefined);
    /**
     * Returns true if the container is disposed. It becomes true as soon as dispose is called, before the current value
     * has finished disposing.
     */
    get disposed(): boolean;
    /**
     * Returns the current disposable object
     */
    get disposable(): T | undefined;
    /**
     * Set the new disposable and dispose the old one. Setting the current disposable again does not dispose it. If the
     * container is disposed, the new disposable is disposed instead.
     * @param disposable a new disposable to set
     * @returns a promise that settles when the old (or rejected) disposable has been disposed, and rejects if that fails
     */
    set(disposable: T | null | undefined): Promise<void>;
    /**
     * Replace the disposable with a new one. Does not dispose the old one. If the container is disposed, the new
     * disposable is disposed, and an error of that disposal goes to {@link safeDisposableExceptionHandlerManager}
     * @param disposable a new disposable to replace the old one
     * @returns the old disposable object or undefined if the container is disposed
     */
    replace(disposable: T | null | undefined): T | undefined;
    /**
     * Dispose only the current disposable object, leaving the container empty and usable
     * @returns a promise that settles when the disposable has been disposed, and rejects if that fails
     */
    disposeCurrent(): Promise<void>;
    /**
     * Dispose the container and the current disposable, after the disposals of replaced values that are already in
     * progress. The returned promise rejects if disposing the current disposable fails. Calls made while the disposal is
     * in progress return the same promise, later calls resolve immediately.
     */
    dispose(): Promise<void>;
}

/**
 * Options of an {@link AsyncDisposable}
 */
interface AsyncDisposableOptions {
    /**
     * The order in which the registered disposables are disposed. Defaults to `fifo`, the order they were registered.
     */
    order?: DisposalOrder;
    /**
     * Receives each error thrown during disposal. Without it, `dispose` rejects with the errors.
     */
    onError?: (e: unknown) => void;
}
/**
 * AsyncDisposable is a base class for disposables whose cleanup is asynchronous: the async counterpart of
 * {@link Disposable}. Everything registered is disposed one after another, each awaited, when the object is disposed.
 * @example
 * class Connection extends AsyncDisposable {
 *   constructor(socket: Socket) {
 *     super({ order: "lifo" })
 *     this.addDisposable(() => socket.end())
 *     this.addTimeout(() => socket.destroy(), 30_000)
 *   }
 * }
 * await using connection = new Connection(socket)
 */
declare abstract class AsyncDisposable$1 extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    constructor(options?: AsyncDisposableOptions);
    /**
     * Returns true if the object has been disposed. It becomes true as soon as dispose is called, before the registered
     * disposables have finished disposing.
     */
    get disposed(): boolean;
    /**
     * Register a disposable object. The object will be disposed when the current object is disposed. If the current
     * object has already been disposed, the disposable is disposed at once.
     * @param t a disposable object
     * @protected inherited classes should use this method to register disposables
     * @returns the disposable object
     */
    protected register<T extends IDisposable | IAsyncDisposable>(t: T): T;
    /**
     * Wait for the disposable and register it. If the current object is disposed in the meantime, the disposable is
     * disposed as soon as it arrives, and the returned promise still resolves with it.
     * @param promiseOrAction a disposable, a promise of one, or a function that returns either
     * @returns the disposable object
     */
    protected registerAsync<T extends IDisposable | IAsyncDisposable>(promiseOrAction: Promise<T> | (() => Promise<T>) | (() => T) | T): Promise<T>;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     */
    protected throwIfDisposed(message?: string): void;
    /**
     * Start a timeout that is cleared when the object is disposed. It is released once it has fired.
     * @param callback a callback to call when the timeout expires
     * @param timeout the number of milliseconds to wait before calling the callback
     * @param options timer options
     * @returns the timeout; disposing it clears the timeout
     */
    protected addTimeout(callback: () => void, timeout: number, options?: TimerOptions): TimeoutDisposable;
    /**
     * Start an interval that is cleared when the object is disposed.
     * @param callback a callback to call when the interval expires
     * @param interval the number of milliseconds to wait between calls to the callback
     * @param options timer options
     * @returns the interval; disposing it clears the interval
     */
    protected addInterval(callback: () => void, interval: number, options?: TimerOptions): IntervalDisposable;
    /**
     * Add a disposable, or a function (sync or async) to call on dispose. If the object has already been disposed, it is
     * disposed at once.
     * @param disposable a disposable to add
     */
    addDisposable(disposable: AsyncDisposableLike | DisposableLike): void;
    /**
     * Add disposables. If the object has already been disposed, they are disposed at once.
     * @param disposables disposables to add
     */
    addDisposables(...disposables: (AsyncDisposableLike | DisposableLike)[]): void;
    /**
     * Dispose everything registered, one after another. Every disposable is disposed even if some of them reject; the
     * errors go to the `onError` option, or reject the returned promise without it (several errors are wrapped in an
     * AggregateError). Calls made while the disposal is in progress return a promise that settles with it.
     */
    dispose(): Promise<void>;
}

type EventListener<T extends Event = Event> = ((this: EventTarget, ev: T) => unknown) | {
    handleEvent(evt: Event): void;
};
interface EventListenerOptions {
    capture?: boolean;
}
interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}
interface EventTarget {
    addEventListener<E extends Event>(type: string, listener: EventListener<E>, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<E extends Event>(type: string, listener: EventListener<E>, options?: boolean | EventListenerOptions): void;
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
declare function addEventListener<E extends Event>(target: EventTarget, type: string, listener: EventListener<E>, options?: boolean | AddEventListenerOptions): Disposiq;

/**
 * An empty disposable that does nothing when disposed.
 */
declare const emptyDisposable: Disposiq & AsyncDisposiq & DisposableCompat & AsyncDisposableCompat;

/**
 * Exception class for scenarios where an exception needs to be thrown when an object is disposed
 */
declare class ObjectDisposedException extends Error {
    constructor(message?: string | undefined);
}
/**
 * Exception class for scenarios where an exception needs to be thrown when an operation has been cancelled
 */
declare class OperationCancelledException extends Error {
    constructor(message?: string | undefined);
}

/**
 * Check if the value is a disposable object. It means it has a `dispose` method.
 */
declare function isDisposable(value: unknown): value is IDisposable;
/**
 * Check if the value is a disposable object or a function. It means it has a `dispose` method, or it is a function.
 */
declare function isDisposableLike(value: unknown): value is DisposableLike;
/**
 * Check if the value is a disposable object with a `dispose` method and an internal `Symbol.dispose` method.
 */
declare function isDisposableCompat(value: unknown): value is DisposableCompat;
/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
declare function isAsyncDisposableCompat(value: unknown): value is AsyncDisposableCompat;
/**
 * Check if the value is a disposable object with an internal `Symbol.dispose` method.
 */
declare function isSystemDisposable(value: unknown): value is Disposable;
/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
declare function isSystemAsyncDisposable(value: unknown): value is AsyncDisposable;

/**
 * A key-value store of values disposed asynchronously: the async counterpart of {@link DisposableMapStore}.
 * Replacing or deleting a value disposes it, and the returned promise settles when that disposal has finished.
 * Disposing the store disposes every value in insertion order, one after another, after the disposals already in
 * progress.
 * @typeParam K the key type
 * @typeParam V the value type
 */
declare class AsyncDisposableMapStore<K, V extends IAsyncDisposable | IDisposable = IAsyncDisposable | IDisposable> extends AsyncDisposiq implements AsyncDisposableAwareCompat, Iterable<[K, V]> {
    /**
     * Returns true if the store has been disposed. It becomes true as soon as dispose is called, before the values have
     * finished disposing.
     */
    get disposed(): boolean;
    /**
     * The number of values in the store
     */
    get size(): number;
    /**
     * Get the value for the key
     * @param key the key
     * @returns the value or undefined if the key is not found
     */
    get(key: K): V | undefined;
    /**
     * Check whether the store has a value for the key
     * @param key the key
     */
    has(key: K): boolean;
    /**
     * The keys of the store, in insertion order
     */
    keys(): IterableIterator<K>;
    /**
     * The values of the store, in insertion order
     */
    values(): IterableIterator<V>;
    /**
     * The key-value pairs of the store, in insertion order
     */
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    /**
     * Set the value for the key. The value it replaces (unless it is the same value) is disposed. If the store is
     * disposed, the value is disposed instead.
     * @param key the key
     * @param value the value
     * @returns a promise that settles when the replaced (or rejected) value has been disposed, and rejects if that fails
     */
    set(key: K, value: V): Promise<void>;
    /**
     * Delete the value for the key and dispose it
     * @param key the key
     * @returns a promise that resolves with true once the value has been disposed, or with false if the key is not
     * found; it rejects if the disposal fails
     */
    delete(key: K): Promise<boolean>;
    /**
     * Remove the value for the key and return it. The value is not disposed
     * @param key the key
     * @returns the value or undefined if the key is not found
     */
    extract(key: K): V | undefined;
    /**
     * Dispose the store and every value, in insertion order, after the disposals of replaced or deleted values that are
     * already in progress. Every value is disposed even if some of them reject; the returned promise then rejects with
     * the error (several errors are wrapped in an AggregateError). Calls made while the disposal is in progress return
     * the same promise, later calls resolve immediately.
     */
    dispose(): Promise<void>;
}

/**
 * Executes a provided action function using a resource that implements the IDisposable interface.
 * Ensures that the resource is properly disposed of after the action completes or if an exception occurs.
 * @param resource The disposable resource to be used in the action.
 * @param action A callback function that performs an operation using the resource.
 * @return Returns the result of the action performed.
 */
declare function using<T extends IDisposable, R>(resource: T, action: (resource: T) => R): R;
/**
 * Executes a provided action function using a resource that implements the IDisposable interface.
 * Ensures that the resource is properly disposed of after the action completes or if an exception occurs.
 * @param resource The disposable resource to be used in the action.
 * @param action A callback function that performs an operation using the resource.
 * @return Returns the result of the action performed.
 */
declare function using<T extends IDisposable | IAsyncDisposable, R>(resource: T, action: (resource: T) => Promise<R>): Promise<R>;

/**
 * Represents a disposable object that holds a weak reference to another object,
 * enabling efficient memory management.
 *
 * This class is particularly useful for scenarios where you want to associate
 * a disposable behavior with an object, but you don't want to prolong its
 * lifespan unnecessarily by holding a strong reference to it.
 *
 * The class ensures that the referenced object's `dispose` method is called
 * when disposing of the `WeakRefDisposable` instance, provided the referenced
 * object is still available.
 *
 * T must be a type that implements `IDisposable`, `IAsyncDisposable`, or is an
 * `AbortController`.
 */
declare class WeakRefDisposable<T extends IDisposable | IAsyncDisposable | AbortController> extends Disposiq {
    constructor(value: T | WeakRef<T>);
    dispose(): void;
}

export { AbortDisposable, SafeActionDisposable as ActionSafeDisposable, SafeAsyncActionDisposable as AsyncActionSafeDisposable, AsyncDisposable$1 as AsyncDisposable, AsyncDisposableAction, type AsyncDisposableAware, type AsyncDisposableAwareCompat, type AsyncDisposableCompat, AsyncDisposableContainer, type AsyncDisposableLike, AsyncDisposableMapStore, type AsyncDisposableOptions, AsyncDisposableStore, type AsyncDisposableStoreOptions, type AsyncDisposeFunc, AsyncDisposiq, AsyncDisposiq as BaseAsyncDisposable, Disposiq as BaseDisposable, BoolDisposable, BoolDisposable as BooleanDisposable, type CanBeDisposable, CancellationToken, CancellationTokenDisposable, type CancellationTokenLike, AsyncDisposableStore as CompositeAsyncDisposable, DisposableStore as CompositeDisposable, Disposable$1 as Disposable, DisposableAction, type DisposableAware, type DisposableAwareCompat, type DisposableCompat, DisposableContainer, DisposableMapStore as DisposableDictionary, type DisposableLike, DisposableMapStore, type DisposableOptions, DisposableStore, type DisposableStoreOptions, type DisposalOrder, type DisposeFunc, Disposiq, type IAsyncDisposable, type IDisposable, type IDisposablesContainer, IntervalDisposable, ObjectDisposedException, OperationCancelledException, SafeActionDisposable, SafeAsyncActionDisposable, DisposableContainer as SerialDisposable, TimeoutDisposable, type TimerOptions, WeakRefDisposable, addEventListener, disposableFromCancellationToken as createCancellationTokenDisposable, createDisposable, createDisposableCompat, createDisposiq, disposableFromCancellationToken, disposableFromEvent, disposableFromEventOnce, disposeAll, disposeAllAsync, disposeAll as disposeAllSafe, disposeAllSafely, disposeAllSafelyAsync, disposeAllUnsafe, disposeAllUnsafeAsync, emptyDisposable, isAsyncDisposableCompat, isDisposable, isDisposableCompat, isDisposableLike, isSystemAsyncDisposable, isSystemDisposable, justDispose, justDisposeAll, justDisposeAllAsync, justDisposeAsync, justDisposeSafe, mergeTokens, disposableFromEvent as on, onCancel, disposableFromEventOnce as once, safeDisposableExceptionHandlerManager, timeoutToken, createDisposable as toDisposable, createDisposableCompat as toDisposableCompat, createDisposiq as toDisposiq, using };
