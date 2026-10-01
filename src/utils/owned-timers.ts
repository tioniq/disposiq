import { IntervalDisposable, TimeoutDisposable, type TimerOptions } from "../timer"

interface TimerOwner {
  readonly disposed: boolean

  remove(item: TimeoutDisposable | IntervalDisposable): boolean
}

/**
 * A timeout that leaves its owner when it fires or is disposed
 * @internal
 */
class OwnedTimeout extends TimeoutDisposable {
  /**
   * @internal
   */
  private readonly _owner: TimerOwner

  constructor(owner: TimerOwner, callback: () => void, ms: number, options: TimerOptions | undefined) {
    super(() => {
      owner.remove(this)
      callback()
    }, ms, options)
    this._owner = owner
  }

  override dispose(): void {
    super.dispose()
    this._owner.remove(this)
  }
}

/**
 * An interval that leaves its owner when it is disposed
 * @internal
 */
class OwnedInterval extends IntervalDisposable {
  /**
   * @internal
   */
  private readonly _owner: TimerOwner

  constructor(owner: TimerOwner, callback: () => void, ms: number, options: TimerOptions | undefined) {
    super(callback, ms, options)
    this._owner = owner
  }

  override dispose(): void {
    super.dispose()
    this._owner.remove(this)
  }
}

/**
 * Create a timeout owned by a container: the container clears it when disposed, and it leaves the container once it
 * has fired or has been disposed. On a disposed container the returned timeout is already disposed and never fires.
 * @internal
 */
export function createOwnedTimeout(
  owner: TimerOwner,
  push: (item: TimeoutDisposable) => void,
  callback: () => void,
  ms: number,
  options: TimerOptions | undefined,
): TimeoutDisposable {
  const timeout = new OwnedTimeout(owner, callback, ms, options)
  if (owner.disposed) {
    timeout.dispose()
    return timeout
  }
  push(timeout)
  return timeout
}

/**
 * Create an interval owned by a container: the container clears it when disposed, and it leaves the container once it
 * has been disposed. On a disposed container the returned interval is already disposed.
 * @internal
 */
export function createOwnedInterval(
  owner: TimerOwner,
  push: (item: IntervalDisposable) => void,
  callback: () => void,
  ms: number,
  options: TimerOptions | undefined,
): IntervalDisposable {
  const interval = new OwnedInterval(owner, callback, ms, options)
  if (owner.disposed) {
    interval.dispose()
    return interval
  }
  push(interval)
  return interval
}
