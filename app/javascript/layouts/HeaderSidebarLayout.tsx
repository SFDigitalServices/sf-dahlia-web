import React from "react"
import Layout from "./Layout"
import { PageHeader } from "@bloom-housing/ui-components"

import "./HeaderSidebarLayout.scss"
import ContactSideBarBlock from "./Sidebar/ContactSidebarBlock"
import { ConfigContext } from "../lib/ConfigContext"

export interface Props {
  children: React.ReactNode
  title: string
  subtitle?: string
  mainPage?: boolean
  sidebarContent?: React.ReactNode
}

const HeaderSidebarLayout = ({ children, title, subtitle, mainPage, sidebarContent }: Props) => {
  const { getAssetPath } = React.useContext(ConfigContext)
  const classNames = mainPage
    ? "info-template-container info-template-container--fluid"
    : "info-template-container"
  return (
    <Layout title={title}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <article className={classNames}>
        <div className="info-template-main-content" data-testid="info-main-content">
          {children}
        </div>
        {sidebarContent || <ContactSideBarBlock />}
      </article>
    </Layout>
  )
}

export default HeaderSidebarLayout
