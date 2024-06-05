import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const MyApplications = () => {
  return (
    <Layout title={"My Applications"}>
      <h1>My Applications</h1>
    </Layout>
  )
}

export default withAppSetup(MyApplications)
