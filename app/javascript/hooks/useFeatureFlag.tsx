import { useFlag as useFlagUnleash, useFlagsStatus } from "@unleash/proxy-client-react"

// If you want to prevent a user from changing this feature flag via the URL, you can add it to the urlBlockList set.
// When set, the feature flag will only be determined by the Unleash API.
const urlBlockList = new Set([""])

export const useFeatureFlag = (flagName: string, defaultValue: boolean) => {
  const urlParams = new URLSearchParams(window.location.search)
  const flagSearchParam = `featureFlag[${flagName}]`

  const doesURLHaveFlag = urlParams.has(flagSearchParam)
  const flagFromUrl = urlParams.get(flagSearchParam)

  const { flagsError } = useFlagsStatus()

  const unleashFlag = useFlagUnleash(flagName)

  if (doesURLHaveFlag && !urlBlockList.has(flagName) && process.env.NODE_ENV === "development") {
    if (flagFromUrl === "true") {
      return true
    } else if (flagFromUrl === "false") {
      return false
    }
  }

  if (flagsError || unleashFlag === undefined) {
    console.error(flagsError)
    return defaultValue
  } else {
    return unleashFlag
  }
}
