import React, { useContext } from "react"

import { setSiteAlertMessage, t, UserNav } from "@sf-digital-services/ui-components"

import UserContext from "../authentication/context/UserContext"
import {
  getAssistancePath,
  getFavoritesPath,
  getMyAccountPath,
  getMyAccountSettingsPath,
  getMyApplicationsPath,
  getRentalDirectoryPath,
  getSaleDirectoryPath,
  getSignInPath,
} from "../util/routeUtil"

const MainNav = () => {
  const currentPath = window.location.pathname
  const { profile, signOut } = useContext(UserContext)
  return (
    <>
      <a
        data-testid="nav-button--rent"
        href={getRentalDirectoryPath(currentPath)}
        className="navbar-item"
      >
        {t("nav.rent")}
      </a>
      <a
        data-testid="nav-button--buy"
        href={getSaleDirectoryPath(currentPath)}
        className="navbar-item"
      >
        {t("nav.buy")}
      </a>
      <a
        data-testid="nav-button--favorites"
        href={getFavoritesPath(currentPath)}
        className="navbar-item"
      >
        {t("nav.myFavorites")}
      </a>
      <a
        data-testid="nav-button--assistance"
        href={getAssistancePath(currentPath)}
        className="navbar-item"
      >
        {t("nav.getAssistance")}
      </a>
      <UserNav
        signedIn={!!profile}
        signOut={() => {
          setSiteAlertMessage(t(`signIn.signedOutSuccessfully`), "notice")
          signOut()
          // TODO: convert this to use react router when SPA routing is added
          window.location.href = getSignInPath(currentPath)
        }}
      >
        <a href={getMyAccountPath(currentPath)} className="navbar-item">
          {t("nav.myDashboard")}
        </a>
        <a href={getMyApplicationsPath(currentPath)} className="navbar-item">
          {t("nav.myApplications")}
        </a>
        <a href={getMyAccountSettingsPath(currentPath)} className="navbar-item">
          {t("nav.accountSettings")}
        </a>
      </UserNav>
    </>
  )
}

export { MainNav as default, MainNav }
