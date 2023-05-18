import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const Disclaimer = () => {
  return (
    <Layout title={"Disclaimer"}>
      {/* Add PageHeader Component (Look in AssistanceLayout) */}
      <h1>Disclaimer </h1>
    </Layout>
  )
}

export default withAppSetup(Disclaimer)
