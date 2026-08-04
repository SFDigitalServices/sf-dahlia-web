import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import styles from "./GetHelp.module.scss"

interface GetHelpProps {
  text: string
  href: string
}

const GetHelp = ({ text, href }: GetHelpProps) => (
  <Card.Section className={styles.helpFooter}>
    <Heading priority={2} size="lg">
      {t("createAccount.getHelp")}
    </Heading>
    <Link hideExternalLinkIcon={true} newWindowTarget className={styles.helpLink} href={href}>
      {text}
    </Link>
  </Card.Section>
)

export default GetHelp
