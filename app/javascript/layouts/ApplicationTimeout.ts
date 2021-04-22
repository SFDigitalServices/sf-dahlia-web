import { createElement, useContext } from "react"

import { IdleTimeout, lRoute, t } from "@sf-digital-services/ui-components"

import UserContext from "../authentication/context/UserContext"

const onTimeout = () => {
  // conductor.reset()
}

const ApplicationTimeout = () => {
  const { profile } = useContext(UserContext)

  if (!profile) return null

  // Only return something if the user is not logged in - otherwise we'll let the root logged in user timeout handle
  // things.
  return createElement(IdleTimeout, {
    promptTitle: t("t.areYouStillWorking"),
    promptText: t("application.timeout.text"),
    promptAction: t("application.timeout.action"),
    redirectPath: lRoute("/"),
    alertMessage: t("application.timeout.afterMessage"),
    alertType: "alert",
    onTimeout,
  })
}

export default ApplicationTimeout
