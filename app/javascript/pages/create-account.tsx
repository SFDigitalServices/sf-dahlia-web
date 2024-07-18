import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
import FormLayout from "../layouts/FormLayout"
interface CreateAccountProps {
  assetPaths: unknown
}

const CreateAccount = (_props: CreateAccountProps) => (
  <FormLayout title={t("pageTitle.createAccount")}>
    <Heading> {t("pageTitle.createAccount")}</Heading>
  </FormLayout>
)

export default withAppSetup(CreateAccount, true)
