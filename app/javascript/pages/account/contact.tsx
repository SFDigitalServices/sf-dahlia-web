import React from "react"
import { Message, Link } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, getMyAccountPath, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"

const Contact = () => {
  return (
    <Layout>
      <AccountLayout>
        <p>Contact info page coming soon! </p>
        <Message>
          {" "}
          Changes update contact info for all applications. This includes applications you already
          submitted.
        </Message>
        <Link href={getMyAccountPath()}> Back to account</Link>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Contact, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Contact,
})
