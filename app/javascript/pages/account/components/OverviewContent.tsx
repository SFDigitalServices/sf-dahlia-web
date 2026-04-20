import React, { useContext } from "react"
import { Icon, t, type UniversalIconType } from "@bloom-housing/ui-components"
import {
  getMyApplicationsPath,
  getMyAccountSettingsPath,
  getSignInPath,
} from "../../../util/routeUtil"
import UserContext from "../../../authentication/context/UserContext"

export const getGreeting = (firstName?: string): string => {
  if (firstName && firstName.trim().length > 0) {
    return t("accountDashboard.greeting", { firstName })
  }
  return t("accountDashboard.greetingGeneric")
}

interface DashboardCardProps {
  icon: UniversalIconType
  title: string
  description: string
  buttonLabel: string
  href: string
}

const DashboardCard = ({ icon, title, description, buttonLabel, href }: DashboardCardProps) => {
  return (
    <div className="overview-card">
      <div className="overview-card__icon">
        <Icon size="xlarge" symbol={icon} />
      </div>
      <div className="overview-card__divider" />
      <div className="overview-card__body">
        <h2 className="overview-card__title">{title}</h2>
        <p className="overview-card__description">{description}</p>
      </div>
      <div className="overview-card__action">
        <a href={href} className="overview-card__button">
          {buttonLabel}
        </a>
      </div>
    </div>
  )
}

const OverviewContent = () => {
  const { profile, signOut } = useContext(UserContext)

  const handleSignOut = () => {
    if (signOut) {
      signOut()
    }
    window.location.href = getSignInPath()
  }

  return (
    <div className="overview-content">
      <h1 className="overview-content__greeting">
        {getGreeting(profile?.firstName)}
      </h1>

      <div className="overview-content__cards">
        <DashboardCard
          icon="application"
          title={t("accountDashboard.applicationsAndLotteryResults")}
          description={t("accountDashboard.applicationsDescription")}
          buttonLabel={t("accountDashboard.seeApplications")}
          href={getMyApplicationsPath()}
        />
        <DashboardCard
          icon="settings"
          title={t("accountSettings.title.sentenceCase")}
          description={t("accountDashboard.settingsDescription")}
          buttonLabel={t("accountDashboard.editSettings")}
          href={getMyAccountSettingsPath()}
        />
      </div>

      <div className="overview-content__signout">
        <button type="button" onClick={handleSignOut} className="overview-content__signout-link">
          {t("accountDashboard.signOutOfAccount")}
        </button>
      </div>
    </div>
  )
}

export default OverviewContent
