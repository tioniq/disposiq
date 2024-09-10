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
type DisposeFunc = () => void;
type DisposableLike = IDisposable | DisposeFunc;
type AsyncDisposeFunc = () => Promise<void>;
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
    addAll(disposables: DisposableLike[]): void;
    /**
     * Removes a disposable from the container.
     * @param disposable Disposable to remove.
     * @returns `true` if the disposable was removed, `false` otherwise.
     */
    remove(disposable: IDisposable): boolean;
    /**
     * Disposes all disposables in the container. The container becomes disposed.
     */
    disposeCurrent(): void;
}
/**
 * An interface for a disposable that can be checked for disposal status.
 */
interface DisposableAware extends IDisposable {
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
 * Represents an action that can be disposed. The action is invoked when the action is disposed.
 * The action is only invoked once.
 * @example
 * const action = new DisposableAction(() => {
 *    console.log("disposed")
 * })
 * action.dispose() // disposed
 * action.dispose() // no-op
 */
declare class DisposableAction implements DisposableAwareCompat {
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
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}
declare class AsyncDisposableAction implements AsyncDisposableAwareCompat {
    private readonly _action;
    private _disposed;
    constructor(action: () => Promise<void>);
    get disposed(): boolean;
    dispose(): Promise<void>;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.asyncDispose](): Promise<void>;
}

/**
 * Disposable is a base class for disposables. It will dispose all added disposables when it is disposed.
 */
declare abstract class Disposable$1 implements DisposableCompat {
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
    /**
     * Dispose the object. If the object has already been disposed, this is a no-op.
     * If the object has not been disposed, all disposables added to the object will be disposed.
     */
    dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}

/**
 * An empty disposable that does nothing when disposed.
 */
declare const emptyDisposable: DisposableCompat;

/**
 * DisposableStore is a container for disposables. It will dispose all added disposables when it is disposed.
 * The store has a disposeCurrent method that will dispose all disposables in the store without disposing the store itself.
 * The store can continue to be used after this method is ¬called.
 */
declare class DisposableStore implements IDisposablesContainer, DisposableAwareCompat {
    constructor();
    /**
     * Returns true if the object has been disposed.
     */
    get disposed(): boolean;
    /**
     * Add disposables to the store. If the store has already been disposed, the disposables will be disposed.
     * @param disposables disposables to add
     */
    add(...disposables: DisposableLike[]): void;
    /**
     * Adds disposables to the container. If the container has already been disposed, the disposables will be disposed.
     * @param disposables Disposables to add.
     */
    addAll(disposables: DisposableLike[]): void;
    /**
     * Add a disposable to the store. If the store has already been disposed, the disposable will be disposed.
     * @param disposable a disposable to add
     * @returns the disposable object
     */
    addOne(disposable: DisposableLike): void;
    /**
     * Remove a disposable from the store. If the disposable is found and removed, it will be disposed.
     * @param disposable a disposable to remove
     * @returns true if the disposable was found and removed
     */
    remove(disposable: IDisposable): boolean;
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
     * Dispose the store. If the store has already been disposed, this is a no-op.
     * If the store has not been disposed, all disposables added to the store will be disposed.
     */
    dispose(): void;
    /**
     * Dispose all disposables in the store. The store does not become disposed. The disposables are removed from the
     * store. The store can continue to be used after this method is called. This method is useful when the store is
     * used as a temporary container. The store can be disposed later by calling the dispose method. Calling add during
     * this method will safely add the disposable to the store without disposing it immediately.
     */
    disposeCurrent(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
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
declare function createDisposable(disposableLike: DisposableLike | Disposable | AsyncDisposable | AbortController): IDisposable;
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
declare function createDisposableCompat(disposableLike: DisposableLike | Disposable | AsyncDisposable | AbortController): DisposableCompat;

/**
 * A container for a disposable object. It can be replaced with another disposable object.
 * When disposed, it will dispose the current disposable object and all future disposable objects
 * @example
 * const container = new DisposableContainer()
 * container.set(createDisposable(() => console.log("disposed")))
 * container.dispose() // disposed
 * container.set(createDisposable(() => console.log("disposed again"))) // disposed again
 */
declare class DisposableContainer implements DisposableAwareCompat {
    constructor(disposable?: IDisposable | undefined);
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
    set(disposable: IDisposable): void;
    /**
     * Replace the disposable with a new one. Does not dispose the old one
     * @param disposable a new disposable to replace the old one
     */
    replace(disposable: IDisposable): void;
    /**
     * Dispose the disposable object. All next set or replace calls will dispose the new disposable object
     */
    dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}

/**
 * Class of a disposable that can be checked for disposal status.
 */
declare class BoolDisposable implements DisposableAwareCompat {
    constructor(disposed?: boolean);
    /**
     * Returns true if the disposable is disposed
     */
    get disposed(): boolean;
    /**
     * Dispose the object
     */
    dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}

/**
 * Dispose all disposables in the array safely. During the disposal process, the array is safe to modify
 * @param disposables an array of disposables
 */
declare function disposeAll(disposables: DisposableLike[]): void;

interface EventEmitterLike {
    on<K extends string | symbol>(event: K, listener: (...args: any[]) => void): any;
    off<K extends string | symbol>(event: K, listener: (...args: any[]) => void): any;
    once?<K extends string | symbol>(event: K, listener: (...args: any[]) => void): any;
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
declare function disposableFromEvent<K extends string | symbol>(emitter: EventEmitterLike, event: K, listener: (...args: any[]) => void): DisposableAwareCompat;
/**
 * Create a disposable from an event emitter. The disposable will remove the listener from the emitter when disposed.
 * The listener will only be called once.
 * @param emitter an event emitter
 * @param event the event name
 * @param listener the event listener
 * @returns a disposable object
 */
declare function disposableFromEventOnce<K extends string | symbol>(emitter: EventEmitterLike, event: K, listener: (...args: any[]) => void): DisposableAwareCompat;

declare const CompositeDisposable: typeof DisposableStore;
declare const SerialDisposable: typeof DisposableContainer;
declare const BooleanDisposable: typeof BoolDisposable;
declare const disposeAllSafe: typeof disposeAll;
declare const on: typeof disposableFromEvent;
declare const once: typeof disposableFromEventOnce;
declare const toDisposable: typeof createDisposable;
declare const toDisposableCompat: typeof createDisposableCompat;

/**
 * Disposable container for AbortController. It will abort the signal when it is disposed.
 */
declare class AbortDisposable implements DisposableAwareCompat {
    constructor(controller: AbortController);
    /**
     * Returns true if the signal is aborted
     */
    get disposed(): boolean;
    /**
     * Returns the signal of the AbortController
     */
    get signal(): AbortSignal;
    /**
     * Abort the signal
     */
    dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}

/**
 * Exception class for scenarios where an exception needs to be thrown when an object is disposed
 */
declare class ObjectDisposedException extends Error {
    constructor(message?: string | undefined);
}

type ExceptionHandler = (error: Error) => void;
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
    handle(error: Error): void;
    /**
     * Handle an exception
     * @param error the exception to handle
     */
    handleAny(error: any): void;
    /**
     * Handle an exception safely
     * @param error the exception to handle
     */
    handleSafe(error: Error): void;
    /**
     * Handle an exception safely
     * @param error the exception to handle
     */
    handleAnySafe(error: any): void;
}

declare const safeDisposableExceptionHandlerManager: ExceptionHandlerManager;
/**
 * Represents a safe action that can be disposed. The action is invoked when the action is disposed.
 */
declare class SafeActionDisposable implements DisposableAwareCompat {
    constructor(action: () => void);
    /**
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    /**
     * Dispose the action. If the action has already been disposed, this is a no-op.
     */
    dispose(): void;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.dispose](): void;
}
/**
 * Represents a safe async action that can be disposed. The action is invoked when the action is disposed.
 */
declare class SafeAsyncActionDisposable implements AsyncDisposableAwareCompat {
    constructor(action: () => Promise<void>);
    /**
     * Returns true if the action has been disposed.
     */
    get disposed(): boolean;
    /**
     * Dispose the action. If the action has already been disposed, this is a no-op.
     */
    dispose(): Promise<void>;
    /**
     * Support for the internal Disposable API
     */
    [Symbol.asyncDispose](): Promise<void>;
}

/**
 * Check if the value is a disposable object. It means it has a `dispose` method.
 */
declare function isDisposable(value: any): value is IDisposable;
/**
 * Check if the value is a disposable object or a function. It means it has a `dispose` method, or it is a function.
 */
declare function isDisposableLike(value: any): value is DisposableLike;
/**
 * Check if the value is a disposable object with a `dispose` method and an internal `Symbol.dispose` method.
 */
declare function isDisposableCompat(value: any): value is DisposableCompat;
/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
declare function isAsyncDisposableCompat(value: any): value is AsyncDisposableCompat;
/**
 * Check if the value is a disposable object with an internal `Symbol.dispose` method.
 */
declare function isSystemDisposable(value: any): value is Disposable;
/**
 * Check if the value is a disposable object with an internal `Symbol.asyncDispose` method.
 */
declare function isSystemAsyncDisposable(value: any): value is AsyncDisposable;

export { AbortDisposable, AsyncDisposableAction, type AsyncDisposableAware, type AsyncDisposableAwareCompat, type AsyncDisposableCompat, type AsyncDisposeFunc, BoolDisposable, BooleanDisposable, CompositeDisposable, Disposable$1 as Disposable, DisposableAction, type DisposableAware, type DisposableAwareCompat, type DisposableCompat, DisposableContainer, type DisposableLike, DisposableStore, type DisposeFunc, type IAsyncDisposable, type IDisposable, type IDisposablesContainer, ObjectDisposedException, SafeActionDisposable, SafeAsyncActionDisposable, SerialDisposable, createDisposable, createDisposableCompat, disposableFromEvent, disposableFromEventOnce, disposeAllSafe, emptyDisposable, isAsyncDisposableCompat, isDisposable, isDisposableCompat, isDisposableLike, isSystemAsyncDisposable, isSystemDisposable, on, once, safeDisposableExceptionHandlerManager, toDisposable, toDisposableCompat };
