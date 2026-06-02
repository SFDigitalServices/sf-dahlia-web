// New accounts layout for my-applications.tsx
import React from "react"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"

const Applications = () => {
  return (
    <Layout>
      <AccountLayout>
        <p>Applications</p>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(Applications, { pageName: AppPages.MyApplications })
