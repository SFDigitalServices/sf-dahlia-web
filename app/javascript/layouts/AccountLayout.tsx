import React from "react"
import AccountNav from "./AccountNav"
import styles from "./AccountLayout.module.scss"

export interface AccountLayoutProps {
  children: React.ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  return (
    <div className={styles.accountLayout}>
      <AccountNav />
      {children}
    </div>
  )
}

export default AccountLayout
