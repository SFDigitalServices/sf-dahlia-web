import React from "react"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"

const ShortFormPage = (_props) => {
  console.log(_props)
  return <Layout>Short Form Application</Layout>
}

export default withAppSetup(ShortFormPage)
