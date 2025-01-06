import { useEffect } from "react"
import TagManager from "react-gtm-module"

export const useGTMInitializer = (gtmId, options = {}) => {
  useEffect(() => {
    if (!gtmId) {
      console.error("No GTM ID provided")
      return
    }

    const tagManagerArgs = {
      gtmId,
      ...options,
    }
    TagManager.initialize(tagManagerArgs)
  }, [gtmId, options])
}
