type Writable<T> = {
  -readonly [TKey in keyof T]: T[TKey]
}

type WSymbol = Writable<SymbolConstructor>

type ISymbolConstructor = (description?: string | number) => symbol

/**
 * Ensure that the global `Symbol` object has the `dispose` property.
 */
if (!("dispose" in Symbol)) {
  const disposeSymbol = (Symbol as ISymbolConstructor)("Symbol.dispose")
  ;(Symbol as WSymbol).dispose = disposeSymbol as SymbolConstructor["dispose"]
}

/**
 * Ensure that the global `Symbol` object has the `asyncDispose` property.
 */
if (!("asyncDispose" in Symbol)) {
  const asyncDisposeSymbol = (Symbol as ISymbolConstructor)(
    "Symbol.asyncDispose",
  )
  ;(Symbol as WSymbol).asyncDispose =
    asyncDisposeSymbol as SymbolConstructor["asyncDispose"]
}
