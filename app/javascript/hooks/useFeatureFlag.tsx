import { useFlag as useFlagUnleash, useFlagsStatus } from "@unleash/proxy-client-react"

// If you want to allow a user to change this feature flag via the URL, you can add it to the urlWhiteList set.
// Unless set, the feature flag will only be determined by the Unleash API.
const urlWhiteList = new Set(["FCFS", "testFlag"])

export const useFeatureFlag = (flagName: string, defaultValue: boolean) => {
  const urlParams = new URLSearchParams(window.location.search)
  const flagSearchParam = `featureFlag[${flagName}]`

  const doesURLHaveFlag = urlParams.has(flagSearchParam)
  const flagFromUrl = urlParams.get(flagSearchParam)

  const { flagsError, flagsReady } = useFlagsStatus()

  const unleashFlag = useFlagUnleash(flagName)

  if (doesURLHaveFlag && urlWhiteList.has(flagName)) {
    if (flagFromUrl === "true") {
      return { flagsReady: true, unleashFlag: true }
    } else if (flagFromUrl === "false") {
      return { flagsReady: true, unleashFlag: false }
    }
  }

  if (flagsError || unleashFlag === undefined) {
    console.error(flagsError)
    return { flagsReady, unleashFlag: defaultValue }
  } else {
    return { flagsReady, unleashFlag }
  }
}
