import React from "react"

import "./how-to-apply.scss"
import Layout from "../../layouts/Layout"
import { Heading, t } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"

interface HowToApplyProps {
  assetPaths: unknown
}

const HowToApply = (_props: HowToApplyProps) => {
  return (
    <Layout title={t("pageTitle.howToApply")}>
      <section className="bg-gray-300 flex justify-center">
        <Heading> {t("pageTitle.howToApply")}</Heading>
      </section>
    </Layout>
  )
}

export default withAppSetup(HowToApply, true)
