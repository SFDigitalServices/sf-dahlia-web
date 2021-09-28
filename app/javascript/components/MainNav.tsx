import React, { useContext } from "react"

import { setSiteAlertMessage, t, NavbarDropdown } from "@bloom-housing/ui-components"

import UserContext from "../authentication/context/UserContext"
import Link from "../navigation/Link"
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

interface UserNavProps {
  signedIn: boolean
  signOut: () => void
}

const UserNav = (props: UserNavProps) => {
  const { signedIn, signOut } = props

  return signedIn ? (
    <>
      <NavbarDropdown menuTitle={t("nav.myAccount")}>
        <Link href={getMyAccountPath()} className="navbar-item">
          {t("nav.myDashboard")}
        </Link>
        <Link href={getMyApplicationsPath()} className="navbar-item">
          {t("nav.myApplications")}
        </Link>
        <Link href={getMyAccountSettingsPath()} className="navbar-item">
          {t("nav.accountSettings")}
        </Link>
        <button className="navbar-item" onClick={signOut}>
          {t("nav.signOut")}
        </button>
      </NavbarDropdown>
    </>
  ) : (
    <>
      <Link className="navbar-item" href={getSignInPath()}>
        {t("nav.signIn")}
      </Link>
    </>
  )
}

const MainNav = () => {
  const { profile, signOut } = useContext(UserContext)
  return (
    <>
      <Link data-testid="nav-button--rent" href={getRentalDirectoryPath()} className="navbar-item">
        {t("nav.rent")}
      </Link>
      <Link data-testid="nav-button--buy" href={getSaleDirectoryPath()} className="navbar-item">
        {t("nav.buy")}
      </Link>
      <Link data-testid="nav-button--favorites" href={getFavoritesPath()} className="navbar-item">
        {t("nav.myFavorites")}
      </Link>
      <Link data-testid="nav-button--assistance" href={getAssistancePath()} className="navbar-item">
        {t("nav.getAssistance")}
      </Link>
      <UserNav
        signedIn={!!profile}
        signOut={() => {
          // FIXME: Setup Site alert message for logging out DAH-974
          // setSiteAlertMessage(t("signIn.signedOutSuccessfully"), "notice")
          signOut()
          // TODO: convert this to use react router when SPA routing is added
          window.location.href = getSignInPath()
        }}
      />
    </>
  )
}

export { MainNav as default, MainNav }
