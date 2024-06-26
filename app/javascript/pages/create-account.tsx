import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
interface CreateAccountProps {
  assetPaths: unknown
}

const CreateAccount = (_props: CreateAccountProps) => (
  <Heading> {t("pageTitle.createAccount")}</Heading>
)

export default withAppSetup(CreateAccount, true)
