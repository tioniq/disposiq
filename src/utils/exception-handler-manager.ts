import { noop } from "./noop"

export type ExceptionHandler = (error: unknown) => void

/**
 * Exception handler manager
 */
export class ExceptionHandlerManager {
  /**
   * @internal
   */
  private readonly _defaultHandler: ExceptionHandler

  /**
   * @internal
   */
  private _handler: ExceptionHandler

  /**
   * Create a new ExceptionHandlerManager with the default handler
   * @param defaultHandler the default handler. If not provided, the default handler will be a no-op
   */
  constructor(defaultHandler?: ExceptionHandler | null) {
    this._handler = this._defaultHandler =
      typeof defaultHandler === "function" ? defaultHandler : noop
  }

  /**
   * Get the handler for the manager
   */
  get handler(): ExceptionHandler {
    return this._handler
  }

  /**
   * Set the handler for the manager
   */
  set handler(value: ExceptionHandler | undefined | null) {
    this._handler = typeof value === "function" ? value : this._defaultHandler
  }

  /**
   * Reset the handler to the default handler
   */
  reset() {
    this._handler = this._defaultHandler
  }

  /**
   * Handle an exception
   * @param error the exception to handle
   */
  handle(error: unknown): void {
    this._handler(error)
  }

  /**
   * Handle an exception safely
   * @param error the exception to handle
   */
  handleSafe(error: Error): void {
    try {
      this.handle(error)
    } catch (e) {}
  }
}
