import { useFlag } from "@unleash/proxy-client-react"

// If you want to prevent a user from changing this feature flag via the URL, you can add it to the urlBlockList set.
// When set, the feature flag will only be determined by the Unleash API.
const urlBlockList = new Set(["title"])

export const useFeatureFlag = (flagName: string) => {
  const urlParams = new URLSearchParams(window.location.search)
  const doesURLHaveFlag = urlParams.has(flagName)
  const flagFromUrl = urlParams.get(flagName) === "true"
  const unleashFlag = useFlag(flagName)

  if (doesURLHaveFlag && !urlBlockList.has(flagName)) {
    return flagFromUrl
  }
  return unleashFlag
}
