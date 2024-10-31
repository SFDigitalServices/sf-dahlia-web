import React from "react"
import Layout from "./Layout"
import { PageHeader } from "@bloom-housing/ui-components"

import "./HeaderSidebarLayout.scss"
import ContactSideBarBlock from "./Sidebar/ContactSidebarBlock"

export interface Props {
  children: React.ReactNode
  title: string
  subtitle?: string
  mainPage?: boolean
  sidebarContent?: React.ReactNode
}

const HeaderSidebarLayout = ({ children, title, subtitle, mainPage, sidebarContent }: Props) => {
  const classNames = mainPage
    ? "flex flex-wrap flex-col md:flex-row relative m-auto w-full"
    : "flex flex-wrap flex-col md:flex-row relative max-w-5xl m-auto w-full"
  return (
    <Layout title={title}>
      <PageHeader title={title} subtitle={subtitle} inverse />
      <article className={classNames}>
        <div className="w-full md:w-2/3" data-testid="info-main-content">
          {children}
        </div>
        {sidebarContent || <ContactSideBarBlock />}
      </article>
    </Layout>
  )
}

export default HeaderSidebarLayout
