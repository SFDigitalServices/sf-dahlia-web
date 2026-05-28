// New accounts layout for my-account.tsx
import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"

const Account = () => {
  const { signOut } = React.useContext(UserContext)
  return (
    <Layout>
      <AccountLayout>
        <p>Account</p>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(Account, { pageName: AppPages.MyAccount })
