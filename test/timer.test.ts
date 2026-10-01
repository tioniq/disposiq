import { IntervalDisposable, TimeoutDisposable } from "../src"

describe("timeout disposable", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("calls the callback once the time has passed", () => {
    const callback = jest.fn()
    const timeout = new TimeoutDisposable(callback, 100)
    jest.advanceTimersByTime(99)
    expect(callback).not.toHaveBeenCalled()
    expect(timeout.disposed).toBe(false)
    expect(timeout.fired).toBe(false)
    jest.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(timeout.fired).toBe(true)
    expect(timeout.disposed).toBe(true)
  })

  it("is cleared when disposed", () => {
    const callback = jest.fn()
    const timeout = new TimeoutDisposable(callback, 100)
    timeout.dispose()
    timeout.dispose()
    jest.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
    expect(timeout.disposed).toBe(true)
    expect(timeout.fired).toBe(false)
  })

  it("is cleared at the end of a 'using' scope", () => {
    const callback = jest.fn()
    {
      using _ = new TimeoutDisposable(callback, 100)
    }
    jest.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
  })
})

describe("interval disposable", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("runs until disposed", () => {
    const callback = jest.fn()
    const interval = new IntervalDisposable(callback, 10)
    jest.advanceTimersByTime(30)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(interval.disposed).toBe(false)
    interval.dispose()
    interval.dispose()
    jest.advanceTimersByTime(30)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(interval.disposed).toBe(true)
  })
})

describe("timer ref", () => {
  it("unrefs the handle with the option, and refs it back", () => {
    const timeout = new TimeoutDisposable(jest.fn(), 10_000, { unref: true })
    const interval = new IntervalDisposable(jest.fn(), 10_000, { unref: true })
    try {
      const timeoutHandle = (timeout as unknown as { _handle: NodeJS.Timeout })._handle
      const intervalHandle = (interval as unknown as { _handle: NodeJS.Timeout })._handle
      expect(timeoutHandle.hasRef()).toBe(false)
      expect(intervalHandle.hasRef()).toBe(false)
      expect(timeout.ref()).toBe(timeout)
      expect(interval.ref()).toBe(interval)
      expect(timeoutHandle.hasRef()).toBe(true)
      expect(intervalHandle.hasRef()).toBe(true)
      expect(timeout.unref()).toBe(timeout)
      expect(interval.unref()).toBe(interval)
      expect(timeoutHandle.hasRef()).toBe(false)
      expect(intervalHandle.hasRef()).toBe(false)
    } finally {
      timeout.dispose()
      interval.dispose()
    }
  })

  it("keeps the handle referenced by default", () => {
    const timeout = new TimeoutDisposable(jest.fn(), 10_000)
    try {
      expect((timeout as unknown as { _handle: NodeJS.Timeout })._handle.hasRef()).toBe(true)
    } finally {
      timeout.dispose()
    }
  })

  it("ignores ref and unref where the handle is a number", () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout").mockReturnValue(1 as unknown as NodeJS.Timeout)
    const setIntervalSpy = jest.spyOn(global, "setInterval").mockReturnValue(2 as unknown as NodeJS.Timeout)
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout").mockImplementation(() => {})
    const clearIntervalSpy = jest.spyOn(global, "clearInterval").mockImplementation(() => {})
    try {
      const timeout = new TimeoutDisposable(jest.fn(), 10, { unref: true })
      const interval = new IntervalDisposable(jest.fn(), 10, { unref: true })
      expect(() => timeout.ref().unref()).not.toThrow()
      expect(() => interval.ref().unref()).not.toThrow()
      timeout.dispose()
      interval.dispose()
      expect(clearTimeoutSpy).toHaveBeenCalledWith(1)
      expect(clearIntervalSpy).toHaveBeenCalledWith(2)
    } finally {
      setTimeoutSpy.mockRestore()
      setIntervalSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    }
  })
})
