import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const AdditionalResources = () => {
  return <Layout title={"Additional Resources"}>{<h1>Additional Resources</h1>}</Layout>
}

export default withAppSetup(AdditionalResources)
