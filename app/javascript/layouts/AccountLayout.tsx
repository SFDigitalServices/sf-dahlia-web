import React from "react"
import AccountSidebar from "../pages/account/components/AccountSidebar"

import "./AccountLayout.scss"

export interface AccountLayoutProps {
  children: React.ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  return (
    <section className="bg-gray-300 border-t border-gray-450">
      <div className="account-layout max-w-5xl mx-auto flex flex-col md:flex-row md:py-8 md:gap-8 md:px-4">
        <div className="md:w-56 flex-shrink-0">
          <AccountSidebar />
        </div>
        <div className="account-layout__content flex-1 min-w-0 bg-white md:rounded-lg md:border md:border-gray-450 p-6 md:p-8">
          {children}
        </div>
      </div>
    </section>
  )
}

export default AccountLayout
