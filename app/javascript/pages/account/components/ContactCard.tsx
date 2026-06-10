import { Icon, IconFillColors, t } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { Card, Button, Heading, Link } from "@bloom-housing/ui-seeds"
import { getMyAccountContactPath } from "../../../util/routeUtil"
import React from "react"
import { User } from "../../../authentication/user"

interface ContactCardProps {
  user?: User
}

const ContactCard = ({ user }: ContactCardProps) => {
  const hasContactInfo = user?.phone || user?.email
  return (
    <Card>
      <Heading priority={1} size="xl">
        {t("accountLayout.accountCard.title", { name: user.firstName + " " + user.lastName })}
      </Heading>
      {hasContactInfo ? (
        <p>{t("accountLayout.accountCard.subtitle")}</p>
      ) : (
        <p>{t("accountLayout.accountCard.noInfo")}</p>
      )}
      <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
      {user?.phone ? (
        <span>{user.phone}</span>
      ) : (
        <Link href={getMyAccountContactPath()}>{t("accountLayout.accountCard.addPhone")}</Link>
      )}
      <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
      {user?.email ? (
        <span>{user.email}</span>
      ) : (
        <Link href={getMyAccountContactPath()}>{t("accountLayout.accountCard.addEmail")}</Link>
      )}
      <Button variant="primary" href={getMyAccountContactPath()}>
        {" "}
        {hasContactInfo
          ? t("accountLayout.accountCard.changeInfo")
          : t("accountLayout.accountCard.addInfo")}
      </Button>
    </Card>
  )
}

export default ContactCard
