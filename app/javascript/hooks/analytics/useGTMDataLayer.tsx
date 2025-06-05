import { useCallback, useContext } from "react"
import TagManager from "react-gtm-module"
import UserContext from "../../authentication/context/UserContext"

export interface DataLayerEvent {
  [key: string]: string | number | boolean
}

const isSnakeCase = (str: string): boolean => {
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(str)
}

const validateAndPushData = (event: string, data: DataLayerEvent) => {
  if (!data || typeof data !== "object") {
    console.error("Data must be an object when pushing to the data layer.")
    return
  }
  if (!event) {
    console.error("An event must be provided when pushing to the data layer.")
    return
  }
  if (!isSnakeCase(event)) {
    console.error(`Event "${event}" must be in snake_case format.`)
    return
  }
  if (data?.event || data?.event_timestamp) {
    console.error("Data object cannot contain an 'event' or 'event_timestamp' key.")
    return
  }
  TagManager.dataLayer({ dataLayer: { event, event_timestamp: new Date().toISOString(), ...data } })
}

// Only use this hook if it is within the UserContext
export const useGTMDataLayer = () => {
  const { profile } = useContext(UserContext)

  const pushToDataLayer = useCallback(
    (event: string, data: DataLayerEvent) => {
      validateAndPushData(event, { user_id: profile?.id || undefined, ...data })
    },
    [profile?.id]
  )

  return { pushToDataLayer }
}

// A pure version of the hook that does not rely on any context
export const useGTMDataLayerWithoutUserContext = () => {
  const pushToDataLayer = useCallback((event: string, data: DataLayerEvent) => {
    validateAndPushData(event, data)
  }, [])

  return { pushToDataLayer }
}
