# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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