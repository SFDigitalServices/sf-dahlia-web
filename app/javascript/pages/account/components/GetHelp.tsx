import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { getSfGovUrl } from "../../../util/languageUtil"
import styles from "./GetHelp.module.scss"

type GetHelpFlow = "signIn" | "createAccount"

interface GetHelpProps {
  flow: GetHelpFlow
}

const GetHelp = ({ flow }: GetHelpProps) => {
  const text = flow === "signIn" ? t("signIn.getHelpLink") : t("createAccount.getHelpLink")
  const href = getSfGovUrl(
    flow === "signIn"
      ? "https://www.sf.gov/sign-in-to-your-dahlia-account"
      : "https://www.sf.gov/learn-how-to-create-dahlia-account"
  )

  return (
    <Card.Section className={styles.helpFooter}>
      <Heading priority={2} size="lg">
        {t("createAccount.getHelp")}
      </Heading>
      <Link hideExternalLinkIcon={true} newWindowTarget className={styles.helpLink} href={href}>
        {text}
      </Link>
    </Card.Section>
  )
}

export default GetHelp
