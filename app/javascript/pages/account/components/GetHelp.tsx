import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { getSfGovUrl } from "../../../util/languageUtil"
import { AUTH_FLOW } from "../../../modules/constants"
import styles from "./GetHelp.module.scss"

interface GetHelpProps {
  flow: AUTH_FLOW
}

const HELP_BY_FLOW: Record<AUTH_FLOW, { textKey: string; href: string }> = {
  [AUTH_FLOW.SIGN_IN]: {
    textKey: "signIn.getHelpLink",
    href: "https://www.sf.gov/sign-in-to-your-dahlia-account",
  },
  [AUTH_FLOW.CREATE_ACCOUNT]: {
    textKey: "createAccount.getHelpLink",
    href: "https://www.sf.gov/learn-how-to-create-dahlia-account",
  },
  [AUTH_FLOW.FORGOT_PASSWORD]: {
    textKey: "signIn.getHelpLink",
    href: "https://www.sf.gov/sign-in-to-your-dahlia-account",
  },
}

const GetHelp = ({ flow }: GetHelpProps) => {
  const { textKey, href } = HELP_BY_FLOW[flow]

  return (
    <Card.Section className={styles.helpFooter}>
      <Heading priority={2} size="lg">
        {t("createAccount.getHelp")}
      </Heading>
      <Link
        hideExternalLinkIcon={true}
        newWindowTarget
        className={styles.helpLink}
        href={getSfGovUrl(href)}
      >
        {t(textKey)}
      </Link>
    </Card.Section>
  )
}

export default GetHelp
