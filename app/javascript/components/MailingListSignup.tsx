import React, { useContext } from "react"
import { ActionBlock, Heading, Icon, t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
import { ConfigContext } from "../lib/ConfigContext"

export const MailingListSignup = () => {
  const { listingsAlertUrl } = useContext(ConfigContext)

  return (
    <ActionBlock
      className={"mt-4"}
      header={<Heading priority={2}>{t("welcome.newListingEmailAlert")}</Heading>}
      background="primary-lighter"
      icon={<Icon size="3xl" symbol="mailThin" fill="transparent" />}
      actions={[
        <Link
          className="button no-underline"
          key="action-1"
          href={listingsAlertUrl}
          newWindowTarget
          hideExternalLinkIcon
        >
          {t("welcome.signUpToday")}
        </Link>,
      ]}
    />
  )
}
