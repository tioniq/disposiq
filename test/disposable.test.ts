import {Disposable, DisposableAction, IDisposable} from "../src";

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
  it("can use global Disposable API", () => {
    let subscription: Subscription
    {
      using _ = new Subscription()
      subscription = _
      expect(_.disposed).toBe(false)
    }
    expect(subscription.disposed).toBe(true)
  })
})

class Subscription extends Disposable {
  constructor() {
    super();
  }

  override get disposed(): boolean {
    return super.disposed;
  }

  override register<T extends IDisposable>(t: T): T {
    return super.register(t);
  }
}