/**
 * Stands in for Clerk's useReverification, whose real implementation reads Clerk's own context
 * and throws under the pass-through ClerkProvider these tests mount. Mirrors its contract: a
 * session_reverification_required error hands complete/cancel to onNeedsReverification, then
 * complete retries the call once and cancel rejects with a reverification_cancelled error.
 */
type NeedsReverification = {
  level: undefined
  complete: () => void
  cancel: () => void
}

const needsReverification = (error: unknown): boolean =>
  (error as { errors?: { code?: string }[] } | undefined)?.errors?.some(
    ({ code }) => code === "session_reverification_required"
  ) ?? false

export const fakeUseReverification =
  <Args extends unknown[], Result>(
    fetcher: (...args: Args) => Promise<Result>,
    options?: { onNeedsReverification?: (needs: NeedsReverification) => void }
  ) =>
  async (...args: Args): Promise<Result> => {
    try {
      return await fetcher(...args)
    } catch (error) {
      if (!needsReverification(error) || !options?.onNeedsReverification) throw error

      await new Promise<void>((resolve, reject) => {
        options.onNeedsReverification?.({
          level: undefined,
          complete: resolve,
          cancel: () =>
            reject(Object.assign(new Error("cancelled"), { code: "reverification_cancelled" })),
        })
      })
      return fetcher(...args)
    }
  }
