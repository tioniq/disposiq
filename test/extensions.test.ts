import {DisposableAction, DisposableStore} from "../src";

describe('disposeWith extension', () => {
  it('should disposeWith add a disposable to a store', () => {
    const action = jest.fn()
    const disposable = new DisposableAction(action)
    const store = new DisposableStore()

    disposable.disposeWith(store)

    expect(disposable.disposed).toBe(false)

    store.dispose()

    expect(disposable.disposed).toBe(true)
  })
})