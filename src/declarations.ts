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

export type DisposeFunc = () => void

export type DisposableLike = IDisposable | DisposeFunc

export type AsyncDisposeFunc = () => Promise<void>

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
  addAll(disposables: DisposableLike[]): void;

  /**
   * Removes a disposable from the container.
   * @param disposable Disposable to remove.
   * @returns `true` if the disposable was removed, `false` otherwise.
   */
  remove(disposable: IDisposable): boolean

  /**
   * Disposes all disposables in the container. The container becomes disposed.
   */
  disposeCurrent(): void
}

/**
 * An interface for a disposable that can be checked for disposal status.
 */
export interface DisposableAware extends IDisposable {
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
export interface DisposableAwareCompat extends DisposableAware, DisposableCompat {

}

/**
 * An interface for an async disposable that can be checked for disposal status.
 */
export interface AsyncDisposableAware extends IAsyncDisposable {
  get disposed(): boolean
}

/**
 * A compatibility interface for IAsyncDisposable interface and global Disposable API
 */
export interface AsyncDisposableCompat extends IAsyncDisposable, AsyncDisposable {

}

/**
 * A compatibility interface for AsyncDisposableAware interface and global Disposable API
 */
export interface AsyncDisposableAwareCompat extends AsyncDisposableAware, AsyncDisposableCompat {

}