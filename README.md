# Disposiq

![Coverage](./coverage/badges.svg)
![npm version](https://img.shields.io/npm/v/@tioniq/disposiq)

**Disposiq** is a library providing utilities for implementing the Disposable pattern, facilitating resource management
and cleanup. This library is a collection of common utilities for managing resources and cleaning up after them using
the Disposable pattern.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Features

- Easy common approach to resource management
- Lightweight and fast with minimal overhead
- No dependencies
- Automatic cleanup support (using 'using' keyword)
- Support dispose a store disposables without disposing the store itself in safe way
- Support timeout and interval callbacks
- Support basing event conversion to disposables (e.g. 'on' and 'once' methods of EventEmitter-like objects)
- Support AbortController as a disposable
- Most of the classes are compatible with both `IDisposable`, global `Disposable` APIs and are aware of their disposal
  state
- Support aliases out of the box for custom use cases

## Installation

You can install the library using npm:

```sh
npm install @tioniq/disposiq
```

## Usage

- Action-based disposable:

```typescript
import {DisposableAction} from '@tioniq/disposiq'

// The action will be executed only once when the disposable is disposed
const disposable = new DisposableAction(() => {
  console.log('Resource cleaned up')
})
disposable.dispose() // Output: Resource cleaned up
```

- Action-based disposable with global Disposable API:

```typescript
import {DisposableAction} from '@tioniq/disposiq'

// If we use the new keyword 'using', the disposable will be disposed automatically when it goes out of scope
{
  using disposable = new DisposableAction(() => {
    console.log('Resource cleaned up')
  })
}
// Output: Resource cleaned up
```

- Store-based disposable:

```typescript
import {DisposableStore, DisposableAction} from '@tioniq/disposiq'

const store = new DisposableStore()
const disposable1 = new DisposableAction(() => {
  console.log('Resource cleaned up 1')
})
const disposable2 = new DisposableAction(() => {
  console.log('Resource cleaned up 2')
})
store.add(disposable1)
store.add(disposable2)
store.dispose() // Output: Resource cleaned up 1, Resource cleaned up 2

// Second dispose will not do anything since the store is already disposed
store.dispose()

// So, the next disposables that are added to the store will be disposed immediately
const disposableAction3 = new DisposableAction(() => {
  console.log('Resource cleaned up 3')
})
store.add(disposableAction3) // Output: Resource cleaned up 3
```

- Store-based disposable to dispose temporary resources:

```typescript
import {DisposableStore, DisposableAction} from '@tioniq/disposiq'

const store = new DisposableStore()
const disposable1 = new DisposableAction(() => {
  console.log('Resource cleaned up 1')
})
store.add(disposable1)
// Dispose the current disposables in the store without disposing the store itself
store.disposeCurrent() // Output: Resource cleaned up 1

// Store is still active, but all contained disposables are disposed and removed from the store
// We can add new disposables to the store

// Also, you can add a function as a disposable to the store
store.add(() => {
  console.log('Resource cleaned up 2')
})

// Dispose the store completely
store.dispose() // Output: Resource cleaned up 2

// The next disposables that are added to the store will be disposed immediately 
```

## API

### IDisposable

An interface representing a disposable object.

#### Methods

- `dispose(): void` - Dispose the object. This method should be idempotent. Implementations should not throw exceptions.
  The method should be safe to call multiple times.

### IAsyncDisposable

An interface representing an asynchronous disposable object.

#### Methods

- `dispose(): Promise<void>` - Dispose the object. This method should be idempotent. Implementations should not throw
  exceptions. The method should be safe to call multiple times.

### DisposableAware

A type representing a disposable object that is aware of its disposal state.

### DisposableCompat

A type representing a disposable object that is compatible with both `IDisposable` and global `Disposable` (
`Symbol.dispose`) APIs.

### DisposableAction

A class representing a disposable action. The action will be executed only once when the disposable is disposed.
This is a simple disposable implementation that takes a function to execute when disposed.

#### Implements

- `DisposableAwareCompat`

### DisposableStore

A container for disposables. It will dispose all added disposables when it is disposed.

#### Implements

- `IDisposablesContainer`
- `DisposableAwareCompat`

#### Methods

- `add(...disposables: DisposableLike[]): void` - Add disposables to the store.
- `add(disposables: DisposableLike[]): void` - Add an array of disposables to the store.
- `addOne(disposable: DisposableLike): void` - Add a single disposable to the store.
- `remove(disposable: IDisposable): boolean` - Remove a disposable from the store.
- `dispose(): void` - Dispose the store and all its disposables.
- `disposeCurrent(): void` - Dispose all disposables in the store without disposing the store itself. The store can be
  used to add new disposables.
- `addTimeout(callback: () => void, timeout: number): void` - Add a timeout callback to the store. The timeout will be
  cleared on dispose.
- `addTimeout(timeout: ReturnType<typeof setTimeout>): void` - Add an existing timeout to the store. The timeout will be
  cleared on dispose.
- `addInterval(callback: () => void, interval: number): void` - Add an interval callback to the store. The interval will
  be cleared on dispose.
- `addInterval(interval: ReturnType<typeof setInterval>): void` - Add an existing interval to the store. The interval
  will be cleared on dispose.

### AbortDisposable

A wrapper around an AbortController that can be used as a disposable object.

#### Implements

- `DisposableAwareCompat`

### BoolDisposable

A utility class that can be used to check if a disposable is disposed.

#### Implements

- `DisposableAwareCompat`

### DisposableContainer

A container for a single disposable object that can be set and disposed.

#### Implements

- `DisposableAwareCompat`

#### Methods

- `set(disposable: DisposableLike): void` - Set a new disposable object and dispose the previous one.
- `replace(disposable: DisposableLike): void` - Replace the current disposable object with a new one without disposing
  the previous one.

### Disposable

An abstract class for disposable objects. It provides a default implementation of the `dispose` method. The main purpose
of this class is to use `register` method to register a disposable object to be disposed when the current object is
disposed.

#### Implements

- `DisposableCompat`

#### Methods

- `protected register<T extends IDisposable>(t: T): T` - Register a disposable object to be disposed when the current
  object is disposed.

### SafeActionDisposable

A class representing a disposable action that handles exception during disposal.

#### Implements

- `DisposableAwareCompat`

### SafeAsyncActionDisposable

A class representing an asynchronous disposable action that handles exception during disposal. The same as
`SafeActionDisposable`, but for asynchronous disposables.

### isDisposable (function)

A function that checks if an object is disposable.

### createDisposable (function)

A function that creates a disposable object from a function, an object that is similar to a disposable, or a system
disposable object.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).
