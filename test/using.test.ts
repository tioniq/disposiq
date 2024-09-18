import {using} from "../src/using";
import {AsyncDisposableAction, DisposableAction} from "../src";
import {noop} from "../src/utils/noop";

describe('using func', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      advanceTimers: true
    })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should dispose resource', () => {
    const resource = new DisposableAction(noop)
    const action = jest.fn()

    using(resource, action)

    expect(resource.disposed).toBe(true)
  })

  it('should dispose resource on error', () => {
    const resource = new DisposableAction(noop)
    const action = jest.fn(() => {
      throw new Error()
    })

    expect(() => using(resource, action)).toThrow()
    expect(resource.disposed).toBe(true)
  })

  it('should dispose resource on async action', async () => {
    const resource = new DisposableAction(noop)
    const action = jest.fn(() => {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(100)
        }, 1000)
      })
    })

    const result = using(resource, action)

    expect(result).toBeInstanceOf(Promise)

    jest.runAllTimers()

    await expect(result).resolves.toBe(100)
    expect(resource.disposed).toBe(true)
  })

  it('should dispose resource on async error', async () => {
    const resource = new DisposableAction(noop)
    const action = jest.fn(() => {
      return new Promise<number>((_, reject) => {
        setTimeout(() => {
          reject(new Error())
        }, 1000)
      })
    })

    const result = using(resource, action)

    expect(result).toBeInstanceOf(Promise)

    jest.runAllTimers()

    await expect(result).rejects.toThrow()
    expect(resource.disposed).toBe(true)
  })

  it('should dispose async resource', async () => {
    let disposedFully = false
    const resource = new AsyncDisposableAction(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 100))
      disposedFully = true
    })
    const action = jest.fn(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 100))
    })

    await using(resource, action)

    expect(disposedFully).toBe(true)
  })

  it('should dispose async resource on error', async () => {
    let disposedFully = false
    const resource = new AsyncDisposableAction(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 100))
      disposedFully = true
    })
    const action = jest.fn(async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 50))
      throw new Error()
    })

    expect(disposedFully).toBe(false)

    await expect(using(resource, action)).rejects.toThrow()

    expect(disposedFully).toBe(true)
  })
})