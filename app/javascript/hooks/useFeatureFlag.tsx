import { useFlag as useFlagUnleash, useFlagsStatus, useVariant } from "@unleash/proxy-client-react"

// If you want to allow a user to change this feature flag via the URL, you can add it to the urlWhiteList set.
// Unless set, the feature flag will only be determined by the Unleash API.
const urlWhiteList = new Set(["testFlag"])

// Our flows navigate without carrying search params, so a URL-only override would
// flip back partway through a flow. Remember it for the tab instead.
const rememberOverride = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // Storage unavailable; the override just stops being sticky.
  }
}

const recallOverride = (key: string) => {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export const useFeatureFlag = (flagName: string, defaultValue: boolean) => {
  const urlParams = new URLSearchParams(window.location.search)
  const flagSearchParam = `featureFlag[${flagName}]`

  const doesURLHaveFlag = urlParams.has(flagSearchParam)
  const flagFromUrl = urlParams.get(flagSearchParam)

  const { flagsError, flagsReady } = useFlagsStatus()

  const unleashFlag = useFlagUnleash(flagName)

  const allowUrlOverride = urlWhiteList.has(flagName) || process.env.UNLEASH_ENV === "development"
  if (allowUrlOverride) {
    // The URL wins over what we remembered, so `=false` turns a sticky override off.
    const override = doesURLHaveFlag ? flagFromUrl : recallOverride(flagSearchParam)
    if (override === "true" || override === "false") {
      if (doesURLHaveFlag) rememberOverride(flagSearchParam, override)
      return { flagsReady: true, unleashFlag: override === "true" }
    }
  }

  if (flagsError || unleashFlag === undefined) {
    console.error(flagsError)
    return { flagsReady, unleashFlag: defaultValue }
  } else {
    return { flagsReady, unleashFlag }
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
