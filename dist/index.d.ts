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
 * A disposable object that is possible to dispose
 */
type CanBeDisposable = DisposableLike | Disposable | AsyncDisposable | AbortController;
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
 * Disposable is a base class for disposables. It will dispose all added disposables when it is disposed.
 */
declare abstract class Disposable$1 extends Disposiq implements DisposableCompat {
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
 * AsyncDisposiq is a base class for disposables that can be disposed asynchronously.
 */
declare abstract class AsyncDisposiq extends Disposiq {
    abstract dispose(): Promise<void>;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.asyncDispose](): Promise<void>;
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
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    dispose(): Promise<void>;
}

/**
 * DisposableStore is a container for disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
declare class DisposableStore extends Disposiq implements IDisposablesContainer, DisposableAwareCompat {
    constructor();
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
     * Remove a disposable from the store. If the disposable is found and removed, it will NOT be disposed
     * @param disposable a disposable to remove
     * @returns true if the disposable was found and removed
     */
    remove(disposable: DisposableLike | null | undefined): boolean;
    /**
     * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
     * @param callback a callback to call when the timeout expires
     * @param timeout the number of milliseconds to wait before calling the callback
     */
    addTimeout(callback: () => void, timeout: number): void;
    /**
     * Add a timeout to the store. If the store has already been disposed, the timeout will be cleared.
     * @param timeout a timeout handle
     */
    addTimeout(timeout: ReturnType<typeof setTimeout> | number): void;
    /**
     * Add an interval to the store. If the store has already been disposed, the interval will be cleared.
     * @param callback a callback to call when the interval expires
     * @param interval the number of milliseconds to wait between calls to the callback
     */
    addInterval(callback: () => void, interval: number): void;
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
     * Dispose the store and all disposables safely. If an error occurs during disposal, the error is caught and
     * passed to the onErrorCallback.
     */
    disposeSafely(onErrorCallback?: (e: unknown) => void): void;
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
     * Set the new disposable and dispose the old one
     * @param disposable a new disposable to set
     */
    set(disposable: CanBeDisposable | null | undefined): void;
    /**
     * Replace the disposable with a new one. Does not dispose the old one
     * @param disposable a new disposable to replace the old one
     */
    replace(disposable: CanBeDisposable | null | undefined): void;
    /**
     * Dispose only the current disposable object without affecting the container's state.
     */
    disposeCurrent(): void;
    dispose(): void;
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
 * Dispose a disposable object or call a dispose function
 * @param disposable a disposable object or a dispose function. Can be null or undefined - no-op
 */
declare function justDispose(disposable: DisposableLike | null | undefined): void;
/**
 * Dispose an async disposable object or call an async dispose function
 * @param disposable an async disposable object or an async dispose function. Can be null or undefined - no-op
 * @returns a promise that resolves when the disposal is complete
 */
declare function justDisposeAsync(disposable: DisposableLike | AsyncDisposableLike | null | undefined): Promise<void>;
/**
 * Dispose all disposables in the array. Will check each item for null or undefined
 * @param disposables an array of disposables
 */
declare function justDisposeAll(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array. Will check each item for null or undefined
 * @param disposables an array of disposables
 * @returns a promise that resolves when all disposals are complete
 */
declare function justDisposeAllAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
declare function disposeAll(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
declare function disposeAllAsync(disposables: (DisposableLike | AsyncDisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 */
declare function disposeAllUnsafe(disposables: (DisposableLike | null | undefined)[]): void;
/**
 * Dispose all async disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 */
declare function disposeAllUnsafeAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[]): Promise<void>;
/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
declare function disposeAllSafely(disposables: (DisposableLike | null | undefined)[], onErrorCallback?: (error: unknown) => void): void;
/**
 * Dispose all disposables in the array unsafely. During the disposal process, the array is not safe to modify
 * @param disposables an array of disposables
 * @param onErrorCallback a callback to handle errors
 */
declare function disposeAllSafelyAsync(disposables: (AsyncDisposableLike | DisposableLike | null | undefined)[], onErrorCallback?: (error: unknown) => void): Promise<void>;

interface EventEmitterLike {
    on<K extends string | symbol>(event: K, listener: (...args: unknown[]) => void): unknown;
    off<K extends string | symbol>(event: K, listener: (...args: unknown[]) => void): unknown;
    once?<K extends string | symbol>(event: K, listener: (...args: unknown[]) => void): unknown;
}
/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener
 * @returns a disposable object
 * @remarks All my trials to infer event name list and listener arguments failed. I had to use (string | symbol) for
 * event name and any[] for listener args. I'm not sure if it's possible to infer them for now.
 * If you can do it, please let me know and let's talk about it))
 */
declare function disposableFromEvent<K extends string | symbol>(emitter: EventEmitterLike, event: K, listener: (...args: unknown[]) => void): DisposableAwareCompat;
/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * The listener will only be called once.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener
 * @returns a disposable object
 */
declare function disposableFromEventOnce<K extends string | symbol>(emitter: EventEmitterLike, event: K, listener: (...args: unknown[]) => void): DisposableAwareCompat;

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
 * A key-value store that stores disposable values. When the store is disposed, all the values will be disposed as well
 */
declare class DisposableMapStore<K> extends Disposiq implements DisposableAware {
    /**
     * Get the disposed state of the store
     */
    get disposed(): boolean;
    /**
     * Set a disposable value for the key. If the store contains a value for the key, the previous value will be disposed.
     * If the store is disposed, the value will be disposed immediately
     * @param key the key
     * @param value the disposable value
     */
    set(key: K, value: CanBeDisposable): void;
    /**
     * Get the disposable value for the key
     * @param key the key
     * @returns the disposable value or undefined if the key is not found
     */
    get(key: K): IDisposable | undefined;
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
    extract(key: K): IDisposable | undefined;
    dispose(): void;
}

/**
 * AsyncDisposableStore is a container for async disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is called.
 */
declare class AsyncDisposableStore extends AsyncDisposiq implements AsyncDisposableAwareCompat {
    /**
     * Returns true if the object has been disposed.
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
     * Dispose all disposables in the store. The store does not become disposed.
     */
    disposeCurrent(): Promise<void>;
    /**
     * Dispose all disposables in the store safely. The store becomes disposed.
     * @param onErrorCallback an optional callback that is invoked if an error occurs during disposal
     */
    disposeSafely(onErrorCallback?: (e: unknown) => void): Promise<void>;
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
declare class CancellationTokenDisposable extends Disposiq implements DisposableAware {
    constructor(token: CancellationTokenLike);
    get disposed(): boolean;
    /**
     * Throw an exception if the object has been disposed.
     * @param message the message to include in the exception
     */
    throwIfDisposed(message?: string): void;
    dispose(): void;
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
     * Dispose the action. If the action has already been disposed, this is a no-op.
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

export { AbortDisposable, AsyncDisposableAction, type AsyncDisposableAware, type AsyncDisposableAwareCompat, type AsyncDisposableCompat, type AsyncDisposableLike, AsyncDisposableStore, type AsyncDisposeFunc, AsyncDisposiq, AsyncDisposiq as BaseAsyncDisposable, Disposiq as BaseDisposable, BoolDisposable, BoolDisposable as BooleanDisposable, type CanBeDisposable, CancellationTokenDisposable, type CancellationTokenLike, AsyncDisposableStore as CompositeAsyncDisposable, DisposableStore as CompositeDisposable, Disposable$1 as Disposable, DisposableAction, type DisposableAware, type DisposableAwareCompat, type DisposableCompat, DisposableContainer, DisposableMapStore as DisposableDictionary, type DisposableLike, DisposableMapStore, DisposableStore, type DisposeFunc, Disposiq, type IAsyncDisposable, type IDisposable, type IDisposablesContainer, ObjectDisposedException, SafeActionDisposable, SafeAsyncActionDisposable, DisposableContainer as SerialDisposable, WeakRefDisposable, addEventListener, disposableFromCancellationToken as createCancellationTokenDisposable, createDisposable, createDisposableCompat, createDisposiq, disposableFromCancellationToken, disposableFromEvent, disposableFromEventOnce, disposeAll, disposeAllAsync, disposeAll as disposeAllSafe, disposeAllSafely, disposeAllSafelyAsync, disposeAllUnsafe, disposeAllUnsafeAsync, emptyDisposable, isAsyncDisposableCompat, isDisposable, isDisposableCompat, isDisposableLike, isSystemAsyncDisposable, isSystemDisposable, justDispose, justDisposeAll, justDisposeAllAsync, justDisposeAsync, disposableFromEvent as on, disposableFromEventOnce as once, safeDisposableExceptionHandlerManager, createDisposable as toDisposable, createDisposableCompat as toDisposableCompat, createDisposiq as toDisposiq, using };
