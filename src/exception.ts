/**
 * Exception class for scenarios where an exception needs to be thrown when an object is disposed
 */
export class ObjectDisposedException extends Error {
  constructor(message?: string | undefined) {
    super(message || "Object disposed")
    this.name = "ObjectDisposedException"
  }
}

/**
 * Exception class for scenarios where an exception needs to be thrown when an operation has been cancelled
 */
export class OperationCancelledException extends Error {
  constructor(message?: string | undefined) {
    super(message || "Operation cancelled")
    this.name = "OperationCancelledException"
  }
}
