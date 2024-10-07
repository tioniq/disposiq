import {DisposableMapStore} from "../src";

describe('map store', () => {
  it('should be disposed', () => {
    const store = new DisposableMapStore()
    expect(store.disposed).toBe(false)
    store.dispose()
    expect(store.disposed).toBe(true)
  })

  it('should set and get a disposable value', () => {
    const store = new DisposableMapStore<string>()
    const disposable = {dispose: jest.fn()}
    store.set('key', disposable)
    expect(store.get('key')).toBe(disposable)
  })

  it('should accept a function as a disposable value', () => {
    const store = new DisposableMapStore<string>()
    const disposable = jest.fn()
    store.set('key', disposable)
    expect(disposable).not.toHaveBeenCalled()
    store.dispose()
    expect(disposable).toHaveBeenCalled()
  })

  it('should dispose previous disposable value when setting a new value', () => {
    const store = new DisposableMapStore<string>()
    const disposable1 = {dispose: jest.fn()}
    const disposable2 = {dispose: jest.fn()}
    store.set('key', disposable1)
    store.set('key', disposable2)
    expect(disposable1.dispose).toHaveBeenCalled()
  })

  it('should delete a disposable value', () => {
    const store = new DisposableMapStore<string>()
    const disposable = {dispose: jest.fn()}
    store.set('key', disposable)
    expect(store.delete('key')).toBe(true)
    expect(disposable.dispose).toHaveBeenCalled()
  })

  it('should extract a disposable value', () => {
    const store = new DisposableMapStore<string>()
    const disposable = {dispose: jest.fn()}
    store.set('key', disposable)
    expect(store.extract('key')).toBe(disposable)
    expect(disposable.dispose).not.toHaveBeenCalled()
    expect(store.get('key')).toBeUndefined()
  })

  it('should extract not fail when no key is found', () => {
    const store = new DisposableMapStore<string>()
    store.set("key", {dispose: jest.fn()})
    expect(store.extract('notExistingKey')).toBeUndefined()
  })

  it('should not return a value when disposed', () => {
    const store = new DisposableMapStore<string>()
    store.set("key", {dispose: jest.fn()})
    store.dispose()
    expect(store.get('key')).toBeUndefined()
  })

  it('should not fail when dispose twice', () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.dispose()
  })

  it('should not fail when set a value after disposed', () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.set("key", {dispose: jest.fn()})
  })

  it('should not fail when get a value after disposed', () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.get("key")
  })

  it('should not fail when delete a value after disposed', () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.delete("key")
  })

  it('should not fail when extract a value after disposed', () => {
    const store = new DisposableMapStore<string>()
    store.dispose()
    store.extract("key")
  })

  it('should not fail when delete a value that does not exist', () => {
    const store = new DisposableMapStore<string>()
    store.delete("key")
  })
})