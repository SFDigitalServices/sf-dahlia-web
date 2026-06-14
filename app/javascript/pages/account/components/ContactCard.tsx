import { t } from "@uic"
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons"
import { Card, Button, Heading, Link, Icon } from "@bloom-housing/ui-seeds"
import { getMyAccountContactPath } from "../../../util/routeUtil"
import React from "react"
import { User } from "../../../authentication/user"
import styles from "./ContactCard.module.css"

interface ContactCardProps {
  user?: User
}

const ContactCard = ({ user }: ContactCardProps) => {
  const hasContactInfo = user?.phone || user?.email
  return (
    <Card className={styles.contactCard}>
      <Heading priority={1} size="2xl">
        {t("accountLayout.accountCard.title", { name: user.firstName + " " + user.lastName })}
      </Heading>
      <p className={styles.subtitle}>
        {t(
          hasContactInfo ? "accountLayout.accountCard.subtitle" : "accountLayout.accountCard.noInfo"
        )}
      </p>
      <div className={styles.contactRow}>
        <Icon icon={faEnvelope} size="sm" className={styles.contactIcon} />
        {user?.email ? (
          <span>{user.email}</span>
        ) : (
          <Link href={getMyAccountContactPath()}>{t("accountLayout.accountCard.addEmail")}</Link>
        )}
      </div>
      <div className={styles.contactRow}>
        <Icon icon={faPhone} size="sm" className={styles.contactIcon} />
        {user?.phone ? (
          <span>{user.phone}</span>
        ) : (
          <Link href={getMyAccountContactPath()}>{t("accountLayout.accountCard.addPhone")}</Link>
        )}
      </div>

      <span>
        <Button variant="primary" className={styles.changeButton} href={getMyAccountContactPath()}>
          {hasContactInfo
            ? t("accountLayout.accountCard.changeInfo")
            : t("accountLayout.accountCard.addInfo")}
        </Button>
      </span>
    </Card>
  )
}

export default ContactCard
