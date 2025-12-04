/**
 * A disposable interface. Uses 'IDisposable' as a name to avoid conflicts with the global 'Disposable' class.
 */
export interface IDisposable {
  dispose(): void
}

/**
 * An async disposable interface. Uses 'IAsyncDisposable' as a name to avoid conflicts with the global 'AsyncDisposable' class.
 */
export interface IAsyncDisposable {
  dispose(): Promise<void>
}

/**
 * A function that disposes a resource.
 */
export type DisposeFunc = () => void

/**
 * A disposable object or a function that disposes a resource.
 */
export type DisposableLike = IDisposable | DisposeFunc

/**
 * A function that disposes a resource asynchronously.
 */
export type AsyncDisposeFunc = () => Promise<void>

/**
 * An async disposable object or a function that disposes a resource asynchronously.
 */
export type AsyncDisposableLike = IAsyncDisposable | AsyncDisposeFunc


/**
 * Represents an interface that provides a mechanism to signal and handle cancellation requests.
 * The interface requires that the `cancel` method be called to request cancellation. All other methods and properties
 * are optional
 */
export interface CancellationTokenLike {
  /**
   * Cancels the current operation or action, stopping any ongoing processes or tasks.
   */
  cancel(): void

  /**
   * Gets a value that indicates whether the operation has been cancelled. Can be a boolean value or a function that
   * returns a boolean value.
   */
  isCancelled?: boolean | (() => boolean)

  /**
   * Throws an exception if the operation has been cancelled.
   */
  throwIfCancelled?(): void

  /**
   * Registers a callback that will be called when the operation is cancelled.
   * @param callback the callback to call when the operation is cancelled
   */
  onCancel?(callback: () => void): void

  /**
   * Removes a callback that was previously registered with the `onCancel` method.
   * @param callback the callback to remove
   */
  removeCallback?(callback: () => void): void
}


/**
 * A disposable object that is possible to dispose
 */
export type CanBeDisposable =
  DisposableLike
  | Disposable
  | AsyncDisposable
  | AbortController
  | CancellationTokenLike
  | {
  unref(): void
}

/**
 * A container interface for disposables collection. Implementation is {@link DisposableStore}.
 */
export interface IDisposablesContainer extends DisposableAware {
  /**
   * Returns true if the container is disposed.
   */
  get disposed(): boolean

  /**
   * Adds disposables to the container.
   * @param disposables Disposables to add.
   */
  add(...disposables: DisposableLike[]): void

  /**
   * Adds disposables to the container.
   * @param disposables Disposables to add.
   */
  add(disposables: DisposableLike[]): void

  /**
   * Adds disposables to the container.
   * @param disposables Disposables to add.
   */
  addAll(disposables: DisposableLike[]): void

  /**
   * Adds a disposable to the container
   * @param disposable Disposable to add
   */
  addOne(disposable: DisposableLike): void

  /**
   * Removes a disposable from the container.
   * @param disposable Disposable to remove.
   * @returns `true` if the disposable was removed, `false` otherwise.
   */
  remove(disposable: DisposableLike): boolean

  /**
   * Disposes all disposables in the container. The container becomes disposed.
   */
  disposeCurrent(): void

  /**
   * Disposes all disposables in the container safely. The container becomes disposed.
   */
  disposeSafely(onErrorCallback?: (e: unknown) => void): void
}

/**
 * An interface for a disposable that can be checked for disposal status.
 */
export interface DisposableAware extends IDisposable {
  /**
   * Returns true if the object is disposed.
   */
  get disposed(): boolean
}

/**
 * A compatibility interface for IDisposable interface and global Disposable API
 */
export interface DisposableCompat extends IDisposable, Disposable {
}

/**
 * A compatibility interface for DisposableAware interface and global Disposable API
 */
export interface DisposableAwareCompat
  extends DisposableAware,
    DisposableCompat {
}

/**
 * An interface for an async disposable that can be checked for disposal status.
 */
export interface AsyncDisposableAware extends IAsyncDisposable {
  /**
   * Returns true if the object is disposed.
   */
  get disposed(): boolean
}

/**
 * A compatibility interface for IAsyncDisposable interface and global Disposable API
 */
export interface AsyncDisposableCompat
  extends IAsyncDisposable,
    AsyncDisposable {
}

/**
 * A compatibility interface for AsyncDisposableAware interface and global Disposable API
 */
export interface AsyncDisposableAwareCompat
  extends AsyncDisposableAware,
    AsyncDisposableCompat {
}
