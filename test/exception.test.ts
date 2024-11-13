import {
  Disposable,
  DisposableAction,
  type IDisposable,
  ObjectDisposedException,
} from "../src"

describe("exception", () => {
  it("should rethrow error", () => {
    const subscription = new Subscription()
    const action = () => {
      throw new ObjectDisposedException("disposed")
    }
    const disposableAction = new DisposableAction(action)
    subscription.dispose()
    expect(() => subscription.register(disposableAction)).toThrow("disposed")
  })
})

class Subscription extends Disposable {
  // biome-ignore lint/complexity/noUselessConstructor: the constructor is necessary
  constructor() {
    super()
  }

  override register<T extends IDisposable>(t: T): T {
    return super.register(t)
  }
}
