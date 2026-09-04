import React from "react"

import { t } from "@bloom-housing/ui-components"

import { AlertReason, getHomepagePath } from "../../util/routeUtil"
import { setSignInPageAlert } from "../token"
import { isAuthenticated, SessionStatus, useSession } from "../session"
import BaseIdleTimeout from "./BaseIdleTimeout"
import { useGTMDataLayer } from "../../hooks/analytics/useGTMDataLayer"

interface IdleTimeoutProps {
  onTimeout?: () => unknown
  useFormTimeout?: boolean
  pageName?: string
}

const IdleTimeout = ({ onTimeout, useFormTimeout = false, pageName }: IdleTimeoutProps) => {
  const { session, timeOut } = useSession()
  const { pushToDataLayer } = useGTMDataLayer()
  const signedIn = isAuthenticated(session)

  const handleTimeout = async (shouldTimeOut: boolean) => {
    onTimeout && (await onTimeout())
    pushToDataLayer("session_exp_warning_action", {
      label: pageName,
      url: window.location.href,
      action: signedIn ? "timed out and logged out" : "timed out not logged in",
      is_during_application_flow: false, // When we move to the react application flow this will need to be updated
    })
    // Ends the session with whichever backend owns it. Previously this only
    // ever called Devise's timeOut, so under Clerk the user was redirected to
    // the sign-in page still signed in, and bounced straight back.
    if (shouldTimeOut) {
      await timeOut()
    }
  }

  // Only offer the logged-in prompt once we know there is a session to lose.
  if (session.status === SessionStatus.SignedIn) {
    return (
      <BaseIdleTimeout
        promptTitle={t("idleTimeout.stayLoggedIn")}
        promptText={t("idleTimeout.sessionInactivityLoggedIn")}
        promptAction={t("t.continue")}
        // Matches where timeOut sends them, so the redirect that BaseIdleTimeout
        // performs afterwards does not strip the explanatory alert param.
        redirectPath={setSignInPageAlert(AlertReason.TimeOut)}
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
