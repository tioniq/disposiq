# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] - 2026-10-01

### Fixed

- The published type definitions declare the private members of the base classes `Disposable` and `AsyncDisposable`
  (they were stripped as `@internal`). A subclass that declares a member with the same name, such as `_store`, is now a
  compile error instead of silently replacing the base's state at runtime

## [1.5.0] - 2026-10-01

### Added

- `order` option (`"fifo"` | `"lifo"`, type `DisposalOrder`) on `DisposableStore`, `AsyncDisposableStore`,
  `Disposable` and `AsyncDisposable`: `lifo` disposes the items in reverse order of addition. The default stays `fifo`
- `AsyncDisposable` base class: the async counterpart of `Disposable` (`register`, `registerAsync`,
  `throwIfDisposed`, `addTimeout`, `addInterval`, `addDisposable(s)`, public `disposed`, `onError` option)
- `serial` option on `AsyncDisposableStore`: each `disposeCurrent` waits for the previous one, and `dispose` /
  `disposeSafely` wait for a `disposeCurrent` in progress
- `disposeCurrentSafely(onError)` on `DisposableStore` and `AsyncDisposableStore`
- `addTimeout` / `addInterval` on `AsyncDisposableStore`
- `TimeoutDisposable` and `IntervalDisposable` timer classes with `ref` / `unref`, and the `TimerOptions` type
- `AsyncDisposableMapStore` and `AsyncDisposableContainer`, the async counterparts of `DisposableMapStore` and
  `DisposableContainer`
- `DisposableMapStore` takes the value type as an optional second type parameter, and has `has`, `size`, `keys`,
  `values`, `entries` and iteration
- `CancellationToken` class, `timeoutToken`, `mergeTokens`, `onCancel` and `OperationCancelledException`

### Changed

- `DisposableStore.addTimeout(callback, ms)` and `addInterval(callback, ms)` return the timer as a disposable and
  accept `TimerOptions`. A timer disposed on its own leaves the store
- `disposableFromEvent` / `disposableFromEventOnce` (`on` / `once`) keep the listener's type, so listeners with typed
  parameters are accepted, and are typed to return a `Disposiq` (they already returned one), so `disposeWith` is
  available on the result

### Fixed

- `CancellationTokenDisposable.disposed` called a token's `isCancelled` method without the token as `this`, which
  failed for tokens implemented as classes
- `disposeSafely` / `disposeCurrentSafely` (sync and async stores), `disposeAllSafely` and `disposeAllSafelyAsync`
  stopped at an error callback that threw, so the remaining items were not disposed and the async variants rejected.
  The remaining items are now disposed, and the callback's own error goes to `safeDisposableExceptionHandlerManager`
- `disposableFromEventOnce` (`once`) threw a `TypeError` on an emitter without a `once` method, which its type allows.
  The listener is now added with `on` and removed before its first call

## [1.4.0] - 2026-09-20

### Fixed

- `AsyncDisposableStore.disposeSafely` did not mark the store as disposed: `disposed` stayed `false`, items added
  afterwards were kept instead of disposed, and a `dispose()` call made while it was running disposed the same items a
  second time. It also returned `undefined` instead of a
  promise when the store was already disposed
- `AsyncDisposableStore.dispose`, `AsyncDisposableAction.dispose` and `SafeAsyncActionDisposable.dispose`: a second call
  made while the first disposal was still running resolved immediately. It now returns the in-progress promise, so it
  waits for the disposal to finish
- `using` with an async action disposed the resource a second time when the action succeeded and `dispose` threw
- `DisposableStore.addTimeout(callback, ms)` kept an entry in the store for every timeout, even after it had fired, so a
  long-lived store grew without bound
- `DisposableAction`, `AsyncDisposableAction`, `SafeActionDisposable` and `SafeAsyncActionDisposable` kept their callback
  (and everything it captured) after being disposed
- `disposeAllUnsafe`, `disposeAllUnsafeAsync` and `DisposableMapStore.dispose` did not clear their items when one of them
  threw, so the disposed items stayed referenced
- `disposeAll` / `disposeAllAsync` (and `disposeCurrent`) no longer keep a very large internal buffer pooled after
  disposing a large store

### Changed

- **Behaviour change:** when a disposable throws during disposal, the remaining ones are still disposed. Before, the
  first error stopped the disposal and the rest were never disposed (the store was already marked disposed, so they
  leaked). A single error is rethrown as is; several errors are wrapped in an `AggregateError`. Affects
  `DisposableStore` and `AsyncDisposableStore` (`dispose`, `disposeCurrent`, `add*` on a disposed store),
  `DisposableMapStore.dispose`, `Disposable.dispose`, and `disposeAll`, `disposeAllAsync`, `disposeAllUnsafe`,
  `disposeAllUnsafeAsync`, `justDisposeAll`, `justDisposeAllAsync`
- **Behaviour change:** setting the value that is already stored no longer disposes it: `DisposableContainer.set(x)`
  when `x` is the current disposable, and `DisposableMapStore.set(key, x)` when `x` is already stored under `key`.
  Before, the stored value was disposed while it stayed in the container
- **Behaviour change:** an `AsyncDisposableAction` whose disposal fails now rejects every call made while it was running,
  not only the first one
- Documented the disposal semantics in the README

## [1.3.6] - 2025-12-04

### Changed

- `replace` method of `DisposableContainer` now returns the old disposable object

## [1.3.5] - 2025-07-25

### Added

- `ActionSafeDisposable` alias for `SafeActionDisposable`
- `AsyncActionSafeDisposable` alias for `SafeAsyncActionDisposable`

## [1.3.4] - 2025-03-28

### Added

- `toSafe` extension method to `Disposiq` and `AsyncDisposiq` classes

## [1.3.3] - 2025-03-21

### Added

- `embedTo` extension method to `Disposiq` class

## [1.3.2] - 2025-03-14

### Added

- `addOneSafe` method for safer disposal handling in `DisposableStore` class

## [1.3.1] - 2025-03-07

### Changed

- Improved `createDisposable`, `createDisiq` and `createDisposableCompat` functions to accept `cancel`-able object

## [1.3.0] - 2025-02-28

### Added

- Added `CancellationTokenDisposable` class
- Added `disposableFromCancellationToken` function

## [1.2.5] - 2025-02-21

### Added

- Added `CanBeDisposable` type

### Changed

- Improved types to allow to accept more objects

## [1.2.4] - 2025-02-14

### Changed

- Added `null` and `undefined` types to parameters of `createDisposable`, `createDisposableCompat` and `createDisposiq`
  functions

## [1.2.3] - 2025-02-07

- Bump update

## [1.2.2] - 2025-01-31

- Bump update

## [1.2.1] - 2025-01-24

### Changed

- Small improvements to `WeakRefDisposable` class

## [1.2.0] - 2025-01-17

### Added

- A new `toPlainObject` method to `Disposiq` class

## [1.1.4] - 2025-01-10

### Changed

- Bump update

## [1.1.3] - 2025-01-03

### Added

- Now `WeakRefDisposable` accepts a `WeakRef` object as a parameter

## [1.1.2] - 2024-12-28

### Added

- Missing documentation

## [1.1.1] - 2024-12-20

### Added

- The new `use` method for `DisposableStore` class

## [1.1.0] - 2024-12-13

### Added

- The new `registerAsync` method for `Disposable` class

## [1.0.20] - 2024-12-06

### Added

- The new `WeakRefDisposable` class to hold the disposable object as a weak reference

## [1.0.19] - 2024-11-29

### Added

- The `disposeWith` param now supports `Disposable` class

## [1.0.18] - 2024-11-23

### Changed

- Improved typings

## [1.0.17] - 2024-11-15

### Added

- Now the `AbortDisposable` will create a new `AbortController` if it is not provided

## [1.0.16] - 2024-11-10

### Fixed

- Improved `addEventListener` typings

## [1.0.15] - 2024-11-08

### Added

- A new method `disposeIn` to Disposiq class that allows to dispose a disposable after a specified delay

## [1.0.14] - 2024-11-01

### Fixed

- Fixed `addEventListener` function was not declared in the index file

## [1.0.13] - 2024-11-01

### Added

- A new function `addEventListener` that allows to add an event listener to an event target and return a disposable

## [1.0.12] - 2024-10-25

### Added

- A new method `toFunction` to `Disposiq` class that allows to convert a disposable to a function

## [1.0.11] - 2024-10-16

### Added

- A new class `AsyncDisposableStore` that allows to store async disposables
- A new function `disposeSafely` that allows to dispose disposables safely without throwing errors
- Method overload for `DisposableStore`.`add` that can accept an array of disposables as an argument

## [1.0.10] - 2024-10-07

### Added

- A new class `DisposableMapStore` that allows to store disposables by a key

## [1.0.9] - 2024-09-29

### Changed

- Disabled minification for the package

## [1.0.8] - 2024-09-23

### Added

- New methods `throwIfDisposed` to `Disposable` and `DisposableStore` classes
- New static function `from` to `DisposableStore` class

## [1.0.7] - 2024-09-22

### Added

- All classes are now extended from `Disposiq` class that allows to use extension methods
- Added `disposeWith` method to `Disposiq` class

### Changed

- Fixed `using` function export
- Improved aliases export

## [1.0.6] - 2024-09-20

### Changed

- Class aliases export fix

## [1.0.5] - 2024-09-18

### Added

- A `using` function as an alternative to the `using` keyword

### Changed

- Readme doc

## [1.0.4] - 2024-09-17

### Added

- Method `addDisposable` and `addDisposables` to `Disposable` class
- Tests for `ObjectPool`, `Queue` and `Disposable` classes

## [1.0.3] - 2024-09-11

### Added

- A method `disposeCurrent` to dispose the current disposables in `DisposableContainer`

## [1.0.2] - 2024-09-10

### Added

- Export `disposeAll` and `disposeAllUnsafe` functions

## [1.0.1] - 2024-09-10

### Changed

- Fixed entry file from esm to cjs

## [1.0.0] - 2024-09-10

### Added

- Initial release