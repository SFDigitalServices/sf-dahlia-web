import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

const HousingCounselors = () => {
  return <Layout title={"Housing Counselors"}>{<h1>Hey</h1>}</Layout>
}

export default withAppSetup(HousingCounselors)
