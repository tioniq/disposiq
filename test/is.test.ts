import {
  AsyncDisposableAction,
  DisposableAction,
  DisposableStore,
  isAsyncDisposableCompat,
  isDisposable,
  isDisposableCompat,
  isDisposableLike, isSystemAsyncDisposable, isSystemDisposable, SafeAsyncActionDisposable
} from "../src";

describe("is", () => {
  it("is disposable", () => {
    expect(isDisposable(new DisposableAction(() => {
    }))).toBe(true)
    expect(isDisposable(new DisposableStore())).toBe(true)
    expect(isDisposable({
      dispose() {
      }
    })).toBe(true)
    expect(isDisposable({})).toBe(false)
    expect(isDisposable(() => {
    })).toBe(false)
    expect(isDisposable(function () {
    })).toBe(false)
    expect(isDisposable(null)).toBe(false)
    expect(isDisposable(undefined)).toBe(false)
    expect(isDisposable(1)).toBe(false)
    expect(isDisposable("")).toBe(false)
    expect(isDisposable(true)).toBe(false)
    expect(isDisposable(Symbol())).toBe(false)
    expect(isDisposable({
      [Symbol.dispose]() {

      }
    })).toBe(false)
  })
  it("is disposable like", () => {
    expect(isDisposableLike(new DisposableAction(() => {
    }))).toBe(true)
    expect(isDisposableLike(new DisposableStore())).toBe(true)
    expect(isDisposableLike({
      dispose() {
      }
    })).toBe(true)
    expect(isDisposableLike(() => {
    })).toBe(true)
    expect(isDisposableLike(function () {
    })).toBe(true)
    expect(isDisposableLike(null)).toBe(false)
    expect(isDisposableLike(undefined)).toBe(false)
    expect(isDisposableLike(1)).toBe(false)
    expect(isDisposableLike("")).toBe(false)
    expect(isDisposableLike(true)).toBe(false)
    expect(isDisposableLike(Symbol())).toBe(false)
    expect(isDisposableLike({
      [Symbol.dispose]() {

      }
    })).toBe(false)
  })
  it("is disposable compat", () => {
    expect(isDisposableCompat(new DisposableAction(() => {
    }))).toBe(true)
    expect(isDisposableCompat(new DisposableStore())).toBe(true)
    expect(isDisposableCompat({
      dispose() {
      },
      [Symbol.asyncDispose]() {

      }
    })).toBe(false)
    expect(isDisposableCompat({
      dispose() {
      },
      [Symbol.dispose]() {

      }
    })).toBe(true)
    expect(isDisposableCompat({
      dispose() {
      }
    })).toBe(false)
    expect(isDisposableCompat({
      [Symbol.dispose]() {

      }
    })).toBe(false)
    expect(isDisposableCompat(() => {
    })).toBe(false)
    expect(isDisposableCompat(function () {
    })).toBe(false)
    expect(isDisposableCompat(null)).toBe(false)
    expect(isDisposableCompat(undefined)).toBe(false)
    expect(isDisposableCompat(1)).toBe(false)
    expect(isDisposableCompat("")).toBe(false)
    expect(isDisposableCompat(true)).toBe(false)
    expect(isDisposableCompat(Symbol())).toBe(false)
  })
  it("is async disposable compat", () => {
    expect(isAsyncDisposableCompat(new DisposableAction(() => {
    }))).toBe(false)
    expect(isAsyncDisposableCompat(new AsyncDisposableAction(Promise.resolve))).toBe(true)
    expect(isAsyncDisposableCompat(new SafeAsyncActionDisposable(Promise.resolve))).toBe(true)
    expect(isAsyncDisposableCompat(new DisposableStore())).toBe(false)
    expect(isAsyncDisposableCompat({
      dispose() {
      },
      [Symbol.dispose]() {

      }
    })).toBe(false)
    expect(isAsyncDisposableCompat({
      dispose() {
      },
      [Symbol.asyncDispose]() {

      }
    })).toBe(true)
    expect(isAsyncDisposableCompat({
      dispose() {
      }
    })).toBe(false)
    expect(isAsyncDisposableCompat({
      [Symbol.asyncDispose]() {

      }
    })).toBe(false)
    expect(isAsyncDisposableCompat(() => {
    })).toBe(false)
    expect(isAsyncDisposableCompat(function () {
    })).toBe(false)
    expect(isAsyncDisposableCompat(null)).toBe(false)
    expect(isAsyncDisposableCompat(undefined)).toBe(false)
    expect(isAsyncDisposableCompat(1)).toBe(false)
    expect(isAsyncDisposableCompat("")).toBe(false)
    expect(isAsyncDisposableCompat(true)).toBe(false)
    expect(isAsyncDisposableCompat(Symbol())).toBe(false)
  })
  it("is system disposable", () => {
    expect(isSystemDisposable(new DisposableAction(() => {
    }))).toBe(true)
    expect(isSystemDisposable(new DisposableStore())).toBe(true)
    expect(isSystemDisposable({
      dispose() {
      }
    })).toBe(false)
    expect(isSystemDisposable({
      [Symbol.dispose]() {
      }
    })).toBe(true)
    expect(isSystemDisposable({
      [Symbol.asyncDispose]() {
      }
    })).toBe(false)
    expect(isSystemDisposable(null)).toBe(false)
  })
  it("is system async disposable", () => {
    expect(isSystemAsyncDisposable(new DisposableAction(() => {
    }))).toBe(false)
    expect(isSystemAsyncDisposable(new AsyncDisposableAction(Promise.resolve))).toBe(true)
    expect(isSystemAsyncDisposable(new DisposableStore())).toBe(false)
    expect(isSystemAsyncDisposable({
      dispose() {
      }
    })).toBe(false)
    expect(isSystemAsyncDisposable({
      [Symbol.dispose]() {
      }
    })).toBe(false)
    expect(isSystemAsyncDisposable({
      [Symbol.asyncDispose]() {
      }
    })).toBe(true)
    expect(isSystemAsyncDisposable(null)).toBe(false)
  })
})