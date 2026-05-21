// New accounts layout for my-account.tsx
import React from "react"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"

const Account = () => {
  return (
    <Layout>
      <AccountLayout>
        <p>Account</p>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.MyAccount,
})
