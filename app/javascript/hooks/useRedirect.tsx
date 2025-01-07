import { useState, useEffect } from "react"
import { clearSiteAlertMessage, setSiteAlertMessage } from "../components/SiteAlert"
import { t } from "@bloom-housing/ui-components"

const handleRedirect = (path: string) => {
  const isRedirectSet = sessionStorage.getItem("redirect")
  if (!isRedirectSet) {
    sessionStorage.setItem("redirect", path)

    setSiteAlertMessage(t("signIn.loginRequired"), "secondary")
  } else {
    sessionStorage.removeItem("redirect")
    clearSiteAlertMessage("secondary")
  }
}

const useRedirect = () => {
  const [redirect, setRedirect] = useState<string | null>(null)

  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect")
    sessionStorage.removeItem("redirect")
    if (redirect) {
      setRedirect(redirect)
    } else {
      setRedirect(null)
      clearSiteAlertMessage("secondary")
    }
  }, [])

  return { redirect, handleRedirect }
}

export default useRedirect
