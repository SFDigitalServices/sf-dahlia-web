import React, { useContext } from "react"

import { t } from "@bloom-housing/ui-components"

import { getHomepagePath, getSignInPath } from "../../util/routeUtil"
import UserContext from "../context/UserContext"
import BaseIdleTimeout from "./BaseIdleTimeout"
import { useGTMDataLayer } from "../../hooks/analytics/useGTMDataLayer"

interface IdleTimeoutProps {
  onTimeout?: () => unknown
  useFormTimeout?: boolean
  pageName?: string
}

const IdleTimeout = ({ onTimeout, useFormTimeout = false, pageName }: IdleTimeoutProps) => {
  const { profile, timeOut } = useContext(UserContext)
  const { pushToDataLayer } = useGTMDataLayer()

  const handleTimeout = async (shouldTimeOut: boolean) => {
    onTimeout && (await onTimeout())
    pushToDataLayer("session_exp_warning_action", {
      label: pageName,
      url: window.location.href,
      action: profile?.id ? "timed out and logged out" : "timed out not logged in",
      is_during_application_flow: false, // When we move to the react application flow this will need to be updated
    })
    timeOut && shouldTimeOut && timeOut()
  }

  // Only render the IdleTimeout component if the user is logged in
  if (profile && timeOut) {
    return (
      <BaseIdleTimeout
        promptTitle={t("idleTimeout.stayLoggedIn")}
        promptText={t("idleTimeout.sessionInactivityLoggedIn")}
        promptAction={t("t.continue")}
        redirectPath={getSignInPath()}
        alertMessage={t("signIn.userTokenValidationTimeout")}
        alertType={useFormTimeout ? "alert" : "notice"}
        onPrompt={() => {
          pushToDataLayer("session_exp_warning_shown", {
            label: pageName,
            url: window.location.href,
            is_during_application_flow: false, // When we move to the react application flow this will need to be updated
          })
        }}
        onTimeoutCancel={() => {
          pushToDataLayer("session_exp_warning_action", {
            label: pageName,
            url: window.location.href,
            action: "user prevented",
            is_during_application_flow: false, // When we move to the react application flow this will need to be updated
          })
        }}
        onTimeout={() => handleTimeout(true)}
      />
    )
  }

  if (useFormTimeout) {
    return (
      <BaseIdleTimeout
        promptTitle={t("idleTimeout.stayLoggedIn")}
        promptText={t("idleTimeout.sessionInactivity")}
        promptAction={t("t.continue")}
        redirectPath={getHomepagePath()}
        alertMessage={t("idleTimeout.sessionExpired")}
        alertType={"alert"}
        onPrompt={() => {
          pushToDataLayer("session_exp_warning_shown", {
            label: pageName,
            url: window.location.href,
            is_during_application_flow: false, // When we move to the react application flow this will need to be updated
          })
        }}
        onTimeoutCancel={() => {
          pushToDataLayer("session_exp_warning_action", {
            label: pageName,
            url: window.location.href,
            action: "user prevented",
            is_during_application_flow: false, // When we move to the react application flow this will need to be updated
          })
        }}
        onTimeout={() => handleTimeout(false)}
      />
    )
  }

  return null
}

export default IdleTimeout
