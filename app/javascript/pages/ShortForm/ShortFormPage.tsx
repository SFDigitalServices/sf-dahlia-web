import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import ShortFormApplication from "./ShortFormApplication"

const ShortFormPage = (_props) => {
  return (
    <Layout>
      <ShortFormApplication listingId={_props.listing_id} />
    </Layout>
  )
}

export default withAppSetup(ShortFormPage)
