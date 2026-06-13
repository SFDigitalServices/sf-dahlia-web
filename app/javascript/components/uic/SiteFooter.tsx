// Vendored from @bloom-housing/ui-components src/footers/SiteFooter.tsx
import * as React from "react"
import "./SiteFooter.scss"

export interface FooterProps {
  children: React.ReactNode
}

const SiteFooter = (props: FooterProps) => <footer className="site-footer">{props.children}</footer>

export { SiteFooter as default, SiteFooter }
