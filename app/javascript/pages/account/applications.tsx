// New accounts layout for my-applications.tsx
import React from "react"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"

const Applications = () => {
  return (
    <Layout>
      <AccountLayout>
        <p>Applications</p>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(
  withAuthentication(Applications, { redirectType: RedirectType.Applications }),
  {
    pageName: AppPages.Applications,
  }
)
