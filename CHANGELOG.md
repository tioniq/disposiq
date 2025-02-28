# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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