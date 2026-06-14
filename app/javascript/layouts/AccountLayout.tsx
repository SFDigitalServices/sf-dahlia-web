import React from "react"
import AccountNav from "./AccountNav"
import styles from "./AccountLayout.module.css"

export interface AccountLayoutProps {
  children: React.ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  return (
    <div className={styles.accountLayoutBackground}>
      <div className={styles.accountLayout}>
        <AccountNav />
        <div className={styles.accountLayoutContent}>{children}</div>
      </div>
    </div>
  )
}

export default AccountLayout
