import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const Privacy = () => {
  return (
    <Layout title={"Privacy Policy"}>
      {/* Add PageHeader Component (Look in AssistanceLayout) */}
      <h1>Privacy Policy Content</h1>
    </Layout>
  )
}

export default withAppSetup(Privacy)
