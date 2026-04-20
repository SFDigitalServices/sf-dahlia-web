import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { t } from "@bloom-housing/ui-components"
import { AppPages, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import AccountLayout from "../../layouts/AccountLayout"
import OverviewContent from "./components/OverviewContent"

interface MyAccountProps {
  assetPaths: unknown
}

const MyAccount = (_props: MyAccountProps) => {
  return (
    <Layout title={t("nav.myDashboard")}>
      <AccountLayout>
        <OverviewContent />
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(MyAccount, { redirectType: RedirectType.Account }), {
  pageName: AppPages.MyAccount,
})
