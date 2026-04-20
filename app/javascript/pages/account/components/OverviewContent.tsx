import React, { useContext } from "react"
import { Card } from "@bloom-housing/ui-seeds"
import { LinkButton, t } from "@bloom-housing/ui-components"
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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {getGreeting(profile?.firstName)}
      </h1>

      <div className="flex flex-col gap-4 mb-6">
        <Card spacing="md" className="rounded-lg">
          <Card.Header>
            <h2 className="text-lg font-bold">
              {t("accountDashboard.applicationsAndLotteryResults")}
            </h2>
          </Card.Header>
          <Card.Section>
            <LinkButton href={getMyApplicationsPath()}>
              {t("accountDashboard.seeApplications")}
            </LinkButton>
          </Card.Section>
        </Card>

        <Card spacing="md" className="rounded-lg">
          <Card.Header>
            <h2 className="text-lg font-bold">
              {t("accountSettings.title.sentenceCase")}
            </h2>
          </Card.Header>
          <Card.Section>
            <LinkButton href={getMyAccountSettingsPath()}>
              {t("accountDashboard.editSettings")}
            </LinkButton>
          </Card.Section>
        </Card>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm text-primary underline bg-transparent border-none cursor-pointer p-0"
      >
        {t("accountDashboard.signOutOfAccount")}
      </button>
    </div>
  )
}

export default OverviewContent
