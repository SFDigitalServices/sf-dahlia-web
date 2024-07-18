import React from "react"

import { t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Heading } from "@bloom-housing/ui-seeds"
import FormLayout from "../layouts/FormLayout"

interface ResetPasswordProps {
  assetPaths: unknown
}

const ResetPassword = (_props: ResetPasswordProps) => (
  <FormLayout title={t("pageTitle.resetPassword")}>
    <Heading> {t("pageTitle.resetPassword")}</Heading>
  </FormLayout>
)

export default withAppSetup(ResetPassword, true)
