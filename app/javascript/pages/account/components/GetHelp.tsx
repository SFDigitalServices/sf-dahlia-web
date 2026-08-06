import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { getSfGovUrl } from "../../../util/languageUtil"
import styles from "./GetHelp.module.scss"

type GetHelpFlow = "signIn" | "createAccount" | "forgotPassword"

interface GetHelpProps {
  flow: GetHelpFlow
}

const HELP_BY_FLOW: Record<GetHelpFlow, { textKey: string; href: string }> = {
  signIn: {
    textKey: "signIn.getHelpLink",
    href: "https://www.sf.gov/sign-in-to-your-dahlia-account",
  },
  createAccount: {
    textKey: "createAccount.getHelpLink",
    href: "https://www.sf.gov/learn-how-to-create-dahlia-account",
  },
  forgotPassword: {
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
