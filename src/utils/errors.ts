type AggregateErrorConstructor = new (
  errors: unknown[],
  message?: string,
) => Error

/**
 * Throw the errors collected during a disposal: a single error is rethrown as is, several are wrapped in an
 * AggregateError (the first one is thrown where AggregateError is not available)
 * @internal
 */
export function throwCollected(errors: unknown[] | undefined): void {
  if (errors === undefined) {
    return
  }
  if (errors.length === 1) {
    throw errors[0]
  }
  const aggregate = (
    globalThis as { AggregateError?: AggregateErrorConstructor }
  ).AggregateError
  if (typeof aggregate === "function") {
    throw new aggregate(errors, "Multiple errors occurred during disposal")
  }
  throw errors[0]
}
