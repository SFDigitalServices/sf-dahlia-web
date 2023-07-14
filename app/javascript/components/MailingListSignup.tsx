import React, { useContext } from "react"
import { ActionBlock, Icon, t } from "@bloom-housing/ui-components"
import Link from "../navigation/Link"
import { ConfigContext } from "../lib/ConfigContext"

export const MailingListSignup = () => {
  const { listingsAlertUrl } = useContext(ConfigContext)

  return (
    <ActionBlock
      className={"mt-4"}
      header={t("welcome.newListingEmailAlert")}
      background="primary-lighter"
      icon={<Icon size="3xl" symbol="mailThin" fill="transparent" />}
      actions={[
        <Link
          className="button"
          key="action-1"
          external={true}
          href={listingsAlertUrl}
          target="_blank"
        >
          {t("welcome.signUpToday")}
        </Link>,
      ]}
    />
  )
}
