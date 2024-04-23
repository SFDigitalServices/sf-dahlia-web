import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { t } from "@bloom-housing/ui-components"
import { Form } from "@formio/react"
import axios from "axios"

// this function is designed to look for data entered into the "mailing address" component from formio
//    for the "kitcken sink" test form, these fields are in the "Shared resources" section
const nextPageListener = (foo) => {
  console.log("detected click on next page")
  console.log("page data:", foo.page)
  console.log("submission data:", foo.submission)
  const mailingAddress = foo.submission.data.mailingAddress
  console.log("mailing address:", mailingAddress)
  if (mailingAddress && mailingAddress.city && mailingAddress.city.length > 0) {
    axios
      .post("/api/v1/addresses/validate.json", {
        address: {
          city: mailingAddress.city,
          state: mailingAddress.state,
          street1: mailingAddress.line1,
          street2: mailingAddress.line2,
          zip: mailingAddress.zip,
        },
      })
      .then((resp) => console.log("validation response:", resp.data))
      .catch((error) => console.log("error response:", error.code, error.response.data))
  }
}

const Disclaimer = () => {
  return (
    <Layout title={t("pageTitle.disclaimer")}>
      <div style={{ border: "10px #f00 solid", padding: "20px" }}>
        <Form
          onNextPage={nextPageListener}
          src="https://formio.sfgov.org/dev-ruehbbakcoznmcf/kitchensink"
        />
      </div>
    </Layout>
  )
}

export default withAppSetup(Disclaimer)
