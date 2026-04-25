import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { t } from "@bloom-housing/ui-components"
import { AppPages, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import AccountLayout from "../../layouts/AccountLayout"
import OverviewContent from "./components/OverviewContent"

interface MyAccountV2Props {
  assetPaths: unknown
}

const MyAccountV2 = (_props: MyAccountV2Props) => {
  return (
    <Layout title={t("nav.myDashboard")}>
      <AccountLayout>
        <OverviewContent />
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(
  withAuthentication(MyAccountV2, { redirectType: RedirectType.Account }),
  { pageName: AppPages.MyAccount }
)
