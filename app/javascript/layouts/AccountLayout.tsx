import React from "react"
import AccountSidebar from "../pages/account/components/AccountSidebar"

import "./AccountLayout.scss"

export interface AccountLayoutProps {
  children: React.ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  return (
    <section className="bg-gray-300">
      <div className="flex flex-col md:flex-row">
        <AccountSidebar />
        <div className="account-layout__content w-full p-4 md:p-8">{children}</div>
      </div>
    </section>
  )
}

export default AccountLayout
