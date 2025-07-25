# Disposiq

![Coverage](./coverage/badges.svg)
![npm version](https://img.shields.io/npm/v/@tioniq/disposiq)
[![JSR](https://jsr.io/badges/@tioniq/disposiq)](https://jsr.io/@tioniq/disposiq)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@tioniq/disposiq)](https://bundlephobia.com/package/@tioniq/disposiq)
![tree-shakeable](https://badgen.net/bundlephobia/tree-shaking/@tioniq/disposiq)
![types](https://badgen.net/npm/types/@tioniq/disposiq)
![downloads](https://img.shields.io/npm/dt/@tioniq/disposiq)
![license](https://img.shields.io/npm/l/@tioniq/disposiq)

**Disposiq** is a utility collection
of [Dispose pattern](https://en.wikipedia.org/wiki/Dispose_pattern).

> This library is compatible with
> upcoming [Explicit Resource Management API](https://github.com/tc39/proposal-explicit-resource-management)
> which is already
> [implemented in Typescript 5.2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html)

Are **you lazy** about cleaning up resources? Does **your code look messy**, and do you want to make it cleaner and
easier to read?
Are you **tired of writing the same code** for cleaning up resources over and over again? Have you **wanted to use the
Dispose pattern** in your project, but you don't know how to start? Then this library is for you!

## Stop talking, show me the code!

### Installation

You can install the library using npm:

```sh
npm install @tioniq/disposiq
```

### Function as a disposable

```typescript
import { DisposableAction } from '@tioniq/disposiq'

// The action will be executed only once when the disposable is disposed
const disposable = new DisposableAction(() => {
  console.log('Resource cleaned up')
})
disposable.dispose() // Output: Resource cleaned up
disposable.dispose() // No output
```

### Store-based disposable

```typescript
import { DisposableStore, DisposableAction } from '@tioniq/disposiq'

const store = new DisposableStore()
const disposable1 = new DisposableAction(() => {
  console.log('Resource cleaned up 1')
})
// DisposableStore accepts functions as disposables
const disposable2 = () => {
  console.log('Resource cleaned up 2')
}
store.add(disposable1)
store.add(disposable2)
store.dispose() // Output: Resource cleaned up 1, Resource cleaned up 2

const disposable3 = () => {
  console.log('Resource cleaned up 3')
}

// After disposing of the store, all disposables added to the store will be disposed of immediately
store.add(disposable3) // Output: Resource cleaned up 3
```

### Store-based disposable to dispose temporary resources

```typescript
import { DisposableStore, DisposableAction } from '@tioniq/disposiq'

const store = new DisposableStore()
const disposable1 = new DisposableAction(() => {
  console.log('Resource cleaned up 1')
})
const disposable2 = new DisposableAction(() => {
  console.log('Resource cleaned up 2')
})
// You can add multiple disposables at once
store.add(disposable1, disposable2)

// Dispose of the current disposables in the store without disposing of the store itself
store.disposeCurrent() // Output: Resource cleaned up 1, Resource cleaned up 2

// The store is still active, but all contained disposables are disposed of and removed from the store
// You can now add new disposables to the store
store.add(() => {
  console.log('Resource cleaned up 3')
}) // No output

// Dispose the store completely
store.dispose() // Output: Resource cleaned up 3
```

### [Explicit Resource Management API](https://github.com/tc39/proposal-explicit-resource-management) support (aka 'using' keyword)

```typescript
import { DisposableStore, DisposableAction } from '@tioniq/disposiq'

// When using the new 'using' keyword, the disposable will be disposed of automatically when it goes out of scope
{
  using disposable = new DisposableAction(() => {
    console.log('Resource cleaned up')
  })
}
// Output: Resource cleaned up

// It also works with other disposable objects from the library. For example, DisposableStore:
{
  using store = new DisposableStore()
  store.add(new DisposableAction(() => {
    console.log('Resource cleaned up')
  }))
} // Output: Resource cleaned up
```

### If you cannot use 'using' keyword

There is a way to achieve the same result without use of the 'using' keyword. You can use the 'using' function instead.

```typescript
import { Disposable, using } from '@tioniq/disposiq'

using(new Client(), async (client) => {
  await client.makeRequest() // Output: Request made
}) // Output: Resource cleaned up

class Client extends Disposable {
  constructor() {
    super()
    this.addDisposable(() => {
      console.log('Resource cleaned up')
    })
  }

  async makeRequest() {
    console.log('Request made')
  }
}
```

You can find a simple example [here](https://github.com/tioniq/disposiq/blob/main/example/peer.ts).
<br>
Also, check out another project built with Disposiq: [Eventiq](https://www.npmjs.com/package/@tioniq/eventiq).
It's an implementation of the Observer pattern using Disposiq. It's an interesting project worth exploring!

## Extensions

The library is flexible and can be extended to custom functionality. All classes in the library extend the `Disposiq`
class, so you can add custom methods to the class.
</br>
For example, you can add a custom method to the `Disposiq` class:

```typescript
import { Disposiq, DisposableAction, IDisposable } from '@tioniq/disposiq'

declare module '@tioniq/disposiq' {
  interface Disposiq {
    togetherWith(other: IDisposable): Disposiq
  }
}

Disposiq.prototype.togetherWith = function (this: Disposiq, other: IDisposable): Disposiq {
  return new DisposableAction(() => {
    this.dispose()
    other.dispose()
  })
}
```

## Inspiration

This library is inspired by the

- [Dispose pattern](https://en.wikipedia.org/wiki/Dispose_pattern) and its principles
- The usage of disposables in [Monaco Editor](https://github.com/microsoft/monaco-editor) and
  [VSCode](https://github.com/microsoft/vscode)
- The usage of disposables
  in [RxJava](https://github.com/ReactiveX/RxJava/blob/3.x/src/main/java/io/reactivex/rxjava3/disposables/Disposable.java)
  and [ReactiveX](https://github.com/dotnet/reactive/blob/840fa395d4a6e36ba4727d7943ea4773897affce/Rx.NET/Source/src/System.Reactive/Disposables/Disposable.cs)
- The C# [IDisposable](https://learn.microsoft.com/en-us/dotnet/api/system.idisposable?view=net-8.0) interface
- The core concept used by major projects like Angular, React, Vue, etc., which utilize a return function or component
  method to clean up resources

## Documentation

### Interfaces & Types

| Interface                    | Short Description                                                 |
|------------------------------|-------------------------------------------------------------------|
| `IDisposable`                | Base interface for disposables                                    |
| `IAsyncDisposable`           | Base interface for asynchronous disposables                       |
| `DisposeFunc`                | A function with no parameters                                     |
| `DisposableLike`             | A function or disposable object                                   |
| `AsyncDisposableLike`        | A function that returns a `Promise` or an async disposable object |
| `AsyncDisposeFunc`           | An asynchronous function with no parameters                       |
| `IDisposablesContainer`      | A container for a collection of disposables                       |
| `DisposableAware`            | Represents a disposable that is aware of its state                |
| `DisposableCompat`           | Represents a disposable compatible with the 'using' keyword       |
| `DisposableAwareCompat`      | Combines `DisposableAware` and `DisposableCompat`                 |
| `AsyncDisposableAware`       | An asynchronous disposable that is aware of its state             |
| `AsyncDisposableCompat`      | An asynchronous disposable compatible with the 'using' keyword    |
| `AsyncDisposableAwareCompat` | Combines `AsyncDisposableAware` and `AsyncDisposableCompat`       |

### Classes

| Class                       | Short Description                                                         | Aliases                     |
|-----------------------------|---------------------------------------------------------------------------|-----------------------------|
| `Disposiq`                  | Base class for all library disposables                                    | - `BaseDisposable`          |
| `AsyncDisposiq`             | Base class for all library asynchronous disposables                       | - `BaseAsyncDisposable`     |
| `DisposableAction`          | A container for a function to be called on dispose                        | -                           |
| `AsyncDisposableAction`     | A container for an asynchronous function to be called on dispose          | -                           |
| `DisposableStore`           | A container for disposables                                               | `CompositeDisposable`       |
| `AsyncDisposableStore`      | A container for async disposables                                         | `CompositeAsyncDisposable`  |
| `DisposableMapStore`        | A container for disposables stored by a key                               | `DisposableDictionary`      |
| `DisposableContainer`       | A container for a disposable object                                       | `SerialDisposable`          |
| `BoolDisposable`            | A object that aware of its disposed state                                 | `BooleanDisposable`         |
| `SafeActionDisposable`      | A container for a function that is safely called on dispose               | `ActionSafeDisposable`      |
| `SafeAsyncActionDisposable` | A container for an asynchronous function that is safely called on dispose | `AsyncActionSafeDisposable` |
| `AbortDisposable`           | A wrapper for AbortController to make it disposable                       | -                           |
| `ObjectDisposedException`   | An exception thrown when an object is already disposed                    | -                           |

### Functions

| Class                     | Short Description                                                                                                    | Aliases            |
|---------------------------|----------------------------------------------------------------------------------------------------------------------|--------------------|
| `disposeAll`              | Dispose of all disposables in the array safely, allowing array modification during disposal                          | disposeAllSafe     |
| `disposeAllUnsafe`        | Dispose of all disposables in the array unsafely, array modification during disposal is dangerous                    | -                  |
| `disposeAllSafely`        | Dispose of all disposables in the array safely, with error callback, array modification during disposal is dangerous | -                  |
| `createDisposable`        | Create a disposable object from a given parameter                                                                    | toDisposable       |
| `createDisposableCompat`  | Create a disposable object from a given parameter compatible with the 'using' keyword                                | toDisposableCompat |
| `disposableFromEvent`     | Create a disposable object from an event listener                                                                    | on                 |
| `disposableFromEventOnce` | Create a disposable object from an event listener that disposes after the first call                                 | once               |
| `isDisposable`            | Check if the object is a disposable object                                                                           | -                  |
| `isDisposableLike`        | Check if the object is a disposable-like                                                                             | -                  |
| `isDisposableCompat`      | Check if the object is a disposable object that is compatible with the 'using' keyword                               | -                  |
| `isAsyncDisposableCompat` | Check if the object is an asynchronous disposable object that is compatible with the 'using' keyword                 | -                  |
| `isSystemDisposable`      | Check if the object is compatible with the system 'using' keyword                                                    | -                  |
| `isSystemAsyncDisposable` | Check if the object is compatible with the system 'await using' keyword                                              | -                  |
| `addEventListener`        | Add an event listener to the target object and return a disposable object. Useful for DOM events                     | -                  |

For more information, please check the [type definitions](https://github.com/tioniq/disposiq/blob/main/dist/index.d.ts)
file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub. Remember to write tests for your
changes.

## License

This project is licensed under the [MIT License](LICENSE).
