// New accounts layout for account-settings.tsx
import React from "react"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"

const Settings = () => {
  return (
    <Layout>
      <AccountLayout>
        <p>Settings</p>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(Settings, { pageName: AppPages.AccountSettings })
