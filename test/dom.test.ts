import { addEventListener } from "../src";

describe('EventTarget', () => {
  it('addEventListener', () => {
    const target = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }
    const listener = jest.fn()
    const options = {capture: true}
    const disposiq = addEventListener(target, 'click', listener, options)
    expect(target.addEventListener).toHaveBeenCalledWith('click', listener, options)
    disposiq.dispose()
    expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, options)
  })
})