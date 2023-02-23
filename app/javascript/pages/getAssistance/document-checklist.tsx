import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const DocumentChecklist = () => {
  return <Layout title={"Document Checklist"}>{<h1>Document Checklist</h1>}</Layout>
}

export default withAppSetup(DocumentChecklist)
