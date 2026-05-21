// New accounts layout for my-account.tsx
import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"
import { AppPages, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import styles from "./account.module.scss"

const Account = () => {
  const { signOut } = React.useContext(UserContext)
  return (
    <Layout>
      <AccountLayout>
        <Button variant="text" onClick={signOut} className={styles.signOut}>
          {t("accountLayout.account.signOut")}
        </Button>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.MyAccount,
})
