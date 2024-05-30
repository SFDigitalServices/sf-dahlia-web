import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

interface MyAccountProps {
  assetPaths: unknown
}

const MyAccount = (_props: MyAccountProps) => {
  return (
    <Layout title={"My Account"}>
      <h1>My Account</h1>
    </Layout>
  )
}

export default withAppSetup(MyAccount)
