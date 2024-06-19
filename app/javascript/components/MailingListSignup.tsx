import React, { useContext } from "react"
import { ActionBlock, Heading, Icon, t, NavigationContext } from "@bloom-housing/ui-components"
import { ConfigContext } from "../lib/ConfigContext"

export const MailingListSignup = () => {
  const { listingsAlertUrl } = useContext(ConfigContext)
  const { LinkComponent } = useContext(NavigationContext)

  return (
    <ActionBlock
      className={"mt-4"}
      header={<Heading priority={2}>{t("welcome.newListingEmailAlert")}</Heading>}
      background="primary-lighter"
      icon={<Icon size="3xl" symbol="mailThin" fill="transparent" />}
      actions={[
        <LinkComponent
          className="button"
          key="action-1"
          // external={true}
          href={listingsAlertUrl}
          target="_blank"
        >
          {t("welcome.signUpToday")}
        </LinkComponent>,
      ]}
    />
  )
}
