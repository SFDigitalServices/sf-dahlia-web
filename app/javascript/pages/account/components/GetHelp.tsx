import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import styles from "./GetHelp.module.scss"
import { getSfGovUrl } from "../../../util/languageUtil"

const GetHelp = () => (
  <Card.Section className={styles.helpFooter}>
    <Heading priority={2} size="lg">
      {t("createAccount.getHelp")}
    </Heading>
    <Link
      hideExternalLinkIcon={true}
      className={styles.helpLink}
      href={getSfGovUrl("https://www.sf.gov/learn-how-to-create-dahlia-account")}
    >
      {t("createAccount.getHelpLink")}
    </Link>
  </Card.Section>
)

export default GetHelp
