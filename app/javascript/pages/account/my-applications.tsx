import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getApplications } from "../../api/authApiService"

const MyApplications = () => {
  getApplications()
    .then((applications) => {
      console.log(applications)
    })
    .catch((error) => {
      console.error(error)
    })
  return (
    <Layout title={"My Applications"}>
      <h1>My Applications</h1>
    </Layout>
  )
}

export default withAppSetup(MyApplications)
