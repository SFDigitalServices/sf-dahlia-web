import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const AccountSettings = () => {
  return (
    <Layout title={"Account Settings"}>
      <h1>Account Settings</h1>
    </Layout>
  )
}

export default withAppSetup(AccountSettings)
