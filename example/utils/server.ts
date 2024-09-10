import {EventEmitter} from "node:events";
import {IConnection} from "./connection";

export interface IServer {
  get connections(): Array<IConnection>

  on(event: "connection", listener: (connection: IConnection) => void): void

  on(event: "close", listener: () => void): void

  off(event: "connection", listener: (connection: IConnection) => void): void

  off(event: "close", listener: () => void): void

  close(): void

  get alive(): Promise<void>
}

export class ServerExample extends EventEmitter<{
  "connection": [IConnection]
  "close": []
}> implements IServer {
  private readonly _connections: IConnection[] = []
  private readonly _alive = new Promise<void>((resolve) => {
    this.once("close", resolve)
  })

  get connections() {
    return [...this._connections]
  }

  /**
   * Returns a promise that resolves when the server is closed.
   */
  get alive(): Promise<void> {
    return this._alive
  }

  // on(event: "close", listener: (connection: IConnection) => void): this;

  addConnection(connection: IConnection) {
    this._connections.push(connection)
    this.emit("connection", connection)
  }

  close() {
    this.emit("close")
  }
}
