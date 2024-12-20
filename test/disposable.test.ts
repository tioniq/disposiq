import { Disposable, DisposableAction, type IDisposable } from "../src"

describe("disposable", () => {
  it("Disposable abstract class should register disposable", () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const disposableAction = new DisposableAction(action)
    const registered = subscription.register(disposableAction)
    expect(registered).toBe(disposableAction)
    expect(subscription.disposed).toBe(false)
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(subscription.disposed).toBe(true)
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("registerAsync should register disposable", async () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const disposableAction = new DisposableAction(action)
    const registered = await subscription.registerAsync(disposableAction)
    expect(registered).toBe(disposableAction)
    expect(subscription.disposed).toBe(false)
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(subscription.disposed).toBe(true)
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("registerAsync should register promise", async () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const actionDisposable = new DisposableAction(action)
    const promise = new Promise<IDisposable>((resolve) => {
      setTimeout(() => {
        resolve(actionDisposable)
      }, 1)
    })
    const registered = await subscription.registerAsync(promise)
    expect(registered).toBe(actionDisposable)
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("registerAsync should register promise after dispose", async () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const actionDisposable = new DisposableAction(action)
    const promise = new Promise<IDisposable>((resolve) => {
      setTimeout(() => {
        resolve(actionDisposable)
      }, 1)
    })
    const registrationPromise = subscription.registerAsync(promise)
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(action).toHaveBeenCalledTimes(0)
    await registrationPromise
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("registerAsync should register function", async () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const actionDisposable = new DisposableAction(action)
    const registrationPromise = subscription.registerAsync(
      async () =>
        new Promise<IDisposable>((resolve) => {
          setTimeout(() => {
            resolve(actionDisposable)
          }, 1)
        }),
    )
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(action).toHaveBeenCalledTimes(0)
    await registrationPromise
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("can use global Disposable API", () => {
    let subscription: Subscription
    {
      using _ = new Subscription()
      subscription = _
      expect(_.disposed).toBe(false)
    }
    expect(subscription.disposed).toBe(true)
  })
  it("should add disposable", () => {
    const subscription = new Subscription()
    const action = jest.fn()
    const disposableAction = new DisposableAction(action)
    subscription.addDisposable(disposableAction)
    expect(subscription.disposed).toBe(false)
    expect(action).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(subscription.disposed).toBe(true)
    expect(action).toHaveBeenCalledTimes(1)
  })
  it("should add disposables", () => {
    const subscription = new Subscription()
    const action1 = jest.fn()
    const disposableAction1 = new DisposableAction(action1)
    const action2 = jest.fn()
    const disposableAction2 = new DisposableAction(action2)
    subscription.addDisposables(disposableAction1, disposableAction2)
    expect(subscription.disposed).toBe(false)
    expect(action1).toHaveBeenCalledTimes(0)
    expect(action2).toHaveBeenCalledTimes(0)
    subscription.dispose()
    expect(subscription.disposed).toBe(true)
    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).toHaveBeenCalledTimes(1)
  })
  it("should throw if disposed", () => {
    const disposable = new Subscription()

    expect(() => disposable.throwIfDisposed()).not.toThrow()

    disposable.dispose()

    expect(() => disposable.throwIfDisposed("test")).toThrow("test")
  })
})

class Subscription extends Disposable {
  // biome-ignore lint/complexity/noUselessConstructor: the constructor is necessary
  constructor() {
    super()
  }

  override get disposed(): boolean {
    return super.disposed
  }

  override register<T extends IDisposable>(t: T): T {
    return super.register(t)
  }

  async registerAsync<T extends IDisposable>(
    promiseOrAction: Promise<T> | (() => Promise<T>) | (() => T) | T,
  ): Promise<T> {
    return super.registerAsync(promiseOrAction)
  }

  override throwIfDisposed(message?: string): void {
    super.throwIfDisposed(message)
  }
}
