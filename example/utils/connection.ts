import { EventEmitter } from "node:events";

export interface IConnection {
  get connected(): boolean

  close(): void

  send(data: string): void

  on(event: "message", listener: (message: string) => void): void

  on(event: "close", listener: (code: number, reason: string) => void): void

  off(event: "message", listener: (message: string) => void): void

  off(event: "close", listener: (code: number, reason: string) => void): void
}

export class ConnectionExample extends EventEmitter<{
  "close": [number, string],
  "message": [string]
}> implements IConnection {
  private _connected = true
  private _sendHandler: ((data: string) => void) | undefined

  get connected() {
    return this._connected
  }

  get sendHandler() {
    return this._sendHandler
  }

  set sendHandler(handler: ((data: string) => void) | undefined) {
    this._sendHandler = handler
  }

  close() {
    this._connected = false
    this.emit("close", 1000, "OK")
  }

  send(data: string) {
    if (this._sendHandler) {
      this._sendHandler(data)
    }
  }
}
