import {DisposableStore, on, once} from "../src";
import {ConnectionExample, IConnection} from "./utils/connection";
import {IServer, ServerExample} from "./utils/server";

// The example demonstrates how to create a server that creates connections every second.
// Each connection sends a message every second and closes after a random time.
// The server logs messages and closes after 10 seconds.
// The server uses a simple EventEmitter-based API for connections and the server.
// In the example we use the DisposableStore to manage subscriptions and intervals.
export default async function main() {
  console.info("Starting server")
  const server = createServer() as ServerExample
  // Create a DisposableStore to manage subscriptions. We use `using` to automatically dispose the store on exit from the block
  using subscriptions = new DisposableStore()
  // We can add multiple subscriptions to the store using `add`
  subscriptions.add(
    // Handle connection
    on(server, "connection", handleConnection),
    // Log server close event
    () => console.info("Server closed"),
    // Handle uncaught exceptions
    on(process, "uncaughtException", error => {
      console.error("Uncaught exception", error)
      process.exit(1)
    }))
  // Close server after 10 seconds
  setTimeout(() => server.close(), 10_000)
  // Wait for server to close
  await server.alive
}

// Create an example server that creates connections every second.
function createServer(): IServer {
  const server = new ServerExample()
  const subscriptions = new DisposableStore()
  server.on("close", () => subscriptions.dispose())
  subscriptions.addInterval(() => {
    const connection = createConnection()
    server.addConnection(connection)
  }, 1000)
  return server
}

let connectionCounter = 0

// Create an example connection that closes after a random time.
function createConnection(): IConnection {
  const connection = new ConnectionExample()
  const id = ++connectionCounter
  connection.sendHandler = message => console.log(`Client ${id}: Received message from a server: ${message}`)
  let closeTimeout = 1000 * (Math.random() + 0.5)
  setTimeout(() => connection.close(), closeTimeout)
  if (Math.random() < 0.5) {
    setTimeout(() => connection.emit("message", "Welcome"), Math.random() * closeTimeout)
  }
  return connection
}

// Below is the implementation of the server and connection handling

interface Peer {
  readonly id: string
  readonly connection: IConnection
  readonly subscriptions: DisposableStore
}

let idCounter = 0
const peers: Peer[] = []

function handleConnection(connection: IConnection) {
  if (!connection.connected) {
    return
  }
  const peer: Peer = {
    id: String(++idCounter),
    connection: connection,
    subscriptions: new DisposableStore()
  }
  peers.push(peer)
  peer.subscriptions.add(on(connection, "message", message => {
    console.log(`Server: Received message from peer ${peer.id}: ${message}`)
    connection.send(`Echo: ${message}`)
  }))
  peer.subscriptions.add(once(connection, "close", (code, reason) => {
    console.log(`Server: Peer ${peer.id} closed with code ${code}: ${reason}`)
    const index = peers.indexOf(peer)
    if (index >= 0) {
      peers.splice(index, 1)
    }
    peer.subscriptions.dispose()
  }))
  let pingCounter = 0
  peer.subscriptions.addInterval(() => {
    connection.send(`Ping ${++pingCounter}`)
  }, 200)
  console.log(`Server: Peer ${peer.id} connected`)
}
