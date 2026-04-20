import React, { useContext } from "react"
import { Icon, t, type UniversalIconType } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../../util/languageUtil"
import {
  getMyAccountPath,
  getMyApplicationsPath,
  getMyAccountSettingsPath,
  getSignInPath,
} from "../../../util/routeUtil"
import UserContext from "../../../authentication/context/UserContext"

export const getActiveSection = (pathname: string): string => {
  const pathWithoutLang = getPathWithoutLanguagePrefix(pathname)
  if (pathWithoutLang.startsWith("/my-applications")) return "applications"
  if (pathWithoutLang.startsWith("/account-settings")) return "settings"
  return "overview"
}

const NAV_ITEMS: Array<{
  key: string
  labelKey: string
  pathGetter: () => string
  icon: UniversalIconType
  section: string
}> = [
  {
    key: "overview",
    labelKey: "nav.myDashboard",
    pathGetter: getMyAccountPath,
    icon: "profile",
    section: "overview",
  },
  {
    key: "applications",
    labelKey: "nav.myApplications",
    pathGetter: getMyApplicationsPath,
    icon: "application",
    section: "applications",
  },
  {
    key: "settings",
    labelKey: "accountSettings.title.sentenceCase",
    pathGetter: getMyAccountSettingsPath,
    icon: "settings",
    section: "settings",
  },
]

const AccountSidebar = () => {
  const { signOut } = useContext(UserContext)
  const activeSection = getActiveSection(window.location.pathname)

  const handleSignOut = () => {
    if (signOut) {
      signOut()
    }
    window.location.href = getSignInPath()
  }

  return (
    <nav aria-label={t("nav.accountNavigation")} className="account-sidebar bg-white p-4 md:p-6">
      <h2 className="text-xs font-bold tracking-widest text-gray-700 mb-4">
        {t("nav.account")}
      </h2>
      <ul className="list-none p-0 m-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.section
          return (
            <li key={item.key}>
              <a
                href={item.pathGetter()}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 text-sm text-gray-750 no-underline hover:text-blue-500 ${
                  isActive ? "account-sidebar__item--active" : ""
                }`}
              >
                <Icon size="medium" symbol={item.icon} />
                <span>{t(item.labelKey)}</span>
              </a>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-750 bg-transparent border-none cursor-pointer hover:text-blue-500 w-full text-left"
          >
            <Icon size="medium" symbol="close" />
            <span>{t("nav.signOut")}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default AccountSidebar
