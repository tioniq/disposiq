import { ExceptionHandlerManager } from "../../src/utils/exception-handler-manager"

describe("exception handler manager", () => {
  it("should return the same handler", () => {
    const handler = jest.fn()
    const manager = new ExceptionHandlerManager(handler)
    expect(manager.handler).toBe(handler)
  })

  it("should return the default handler", () => {
    const manager = new ExceptionHandlerManager()
    expect(manager.handler).toBe(manager.handler)
  })

  it("should set the handler", () => {
    const handler = jest.fn()
    const manager = new ExceptionHandlerManager()
    manager.handler = handler
    expect(manager.handler).toBe(handler)
  })

  it("should reset the handler", () => {
    const handler = jest.fn()
    const manager = new ExceptionHandlerManager(handler)
    manager.handler = jest.fn()
    manager.reset()
    expect(manager.handler).toBe(handler)
  })

  it("should handle an exception", () => {
    const handler = jest.fn()
    const manager = new ExceptionHandlerManager(handler)
    manager.handle(new Error())
    expect(handler).toHaveBeenCalled()
  })

  it("should handle an exception safely", () => {
    const handler = () => {
      throw new Error()
    }
    const manager = new ExceptionHandlerManager(handler)
    expect(() => manager.handleSafe(new Error())).not.toThrow()
  })
})
