import { useCallback } from "react"
import TagManager from "react-gtm-module"

export const useGTMDataLayer = () => {
  const pushToDataLayer = useCallback((event, data) => {
    if (!data || typeof data !== "object") {
      console.error("Data must be an object when pushing to the data layer.")
      return
    }
    if (!event) {
      console.error("An event must be provided when pushing to the data layer.")
      return
    }
    TagManager.dataLayer({ dataLayer: { event, ...data } })
  }, [])

  return { pushToDataLayer }
}
