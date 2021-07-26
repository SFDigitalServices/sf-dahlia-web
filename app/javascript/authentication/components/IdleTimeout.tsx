import React, { useContext } from "react"

import { t } from "@bloom-housing/ui-components"

import { getHomepagePath, getSignInPath } from "../../util/routeUtil"
import UserContext from "../context/UserContext"
import BaseIdleTimeout from "./BaseIdleTimeout"

interface IdleTimeoutProps {
  onTimeout?: () => unknown
  useFormTimeout?: boolean
}

const IdleTimeout = ({ onTimeout, useFormTimeout = false }: IdleTimeoutProps) => {
  const { profile, signOut } = useContext(UserContext)

  const handleTimeout = async (shouldSignOut: boolean) => {
    onTimeout && (await onTimeout())
    signOut && shouldSignOut && signOut()
  }

  // Only render the IdleTimeout component if the user is logged in
  if (profile && signOut) {
    return (
      <BaseIdleTimeout
        promptTitle={t("idleTimeout.stayLoggedIn")}
        promptText={t("idleTimeout.sessionInactivityLoggedIn")}
        promptAction={t("t.continue")}
        redirectPath={getSignInPath()}
        alertMessage={t("signIn.userTokenValidationTimeout")}
        alertType={useFormTimeout ? "alert" : "notice"}
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
        onTimeout={() => handleTimeout(false)}
      />
    )
  }

  return null
}

export default IdleTimeout
