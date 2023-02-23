import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const DocumentChecklist = () => {
  return (
    <Layout title={"Document Checklist"}>
      {
        <div className="flex flex-col justify-around h-screen">
          <h1>Document Checklist</h1>

          <h2 id="anchorMe">I'm an anchor</h2>
        </div>
      }
    </Layout>
  )
}

export default withAppSetup(DocumentChecklist)
