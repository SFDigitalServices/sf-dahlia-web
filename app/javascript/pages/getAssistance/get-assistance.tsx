import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const GetAssistance = () => {
  return <Layout title={"Get Assistance"}>{<h1>Get Assistance</h1>}</Layout>
}

export default withAppSetup(GetAssistance)
