import { useFlag as useFlagUnleash, useFlagsStatus, useVariant } from "@unleash/proxy-client-react"

// If you want to allow a user to change this feature flag via the URL, you can add it to the urlWhiteList set.
// Unless set, the feature flag will only be determined by the Unleash API.
const urlWhiteList = new Set(["testFlag"])

export const useFeatureFlag = (flagName: string, defaultValue: boolean) => {
  const urlParams = new URLSearchParams(window.location.search)
  const flagSearchParam = `featureFlag[${flagName}]`

  const doesURLHaveFlag = urlParams.has(flagSearchParam)
  const flagFromUrl = urlParams.get(flagSearchParam)

  const { flagsError, flagsReady } = useFlagsStatus()

  const unleashFlag = useFlagUnleash(flagName)
  const variant = useVariant(flagName)

  const allowUrlOverride = urlWhiteList.has(flagName) || process.env.UNLEASH_ENV === "development"
  if (doesURLHaveFlag && allowUrlOverride) {
    if (flagFromUrl === "true") {
      return { flagsReady: true, unleashFlag: true, variant }
    } else if (flagFromUrl === "false") {
      return { flagsReady: true, unleashFlag: false, variant }
    }
  }

  if (flagsError || unleashFlag === undefined) {
    console.error(flagsError)
    return { flagsReady, unleashFlag: defaultValue, variant }
  } else {
    return { flagsReady, unleashFlag, variant }
  }
}

export const useVariantFlag = (flagName: string, defaultValue: boolean) => {
  const { flagsError, flagsReady } = useFlagsStatus()
  const unleashFlag = useFlagUnleash(flagName)
  const variant = useVariant(flagName)
  if (flagsError || variant === undefined) {
    console.error(flagsError)
    return { flagsReady, unleashFlag: defaultValue, variant: defaultValue }
  } else {
    return { flagsReady, unleashFlag, variant }
  }
}
