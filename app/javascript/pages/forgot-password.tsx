import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
import FormsLayout from "../layouts/FormLayout"

interface ForgotPasswordProps {
  assetPaths: unknown
}

const ForgotPassword = (_props: ForgotPasswordProps) => (
  <FormsLayout title={t("pageTitle.forgotPassword")}>
    <Heading> {t("pageTitle.forgotPassword")}</Heading>
  </FormsLayout>
)

export default withAppSetup(ForgotPassword, true)
