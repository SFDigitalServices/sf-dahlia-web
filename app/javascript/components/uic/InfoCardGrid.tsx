// Vendored from @bloom-housing/ui-components src/sections/InfoCardGrid.tsx
import * as React from "react"
import { Heading } from "./Heading"
import "./InfoCardGrid.css"

export interface InfoCardGridProps {
  title: string
  subtitle?: string
  defaultHeadingStyle?: boolean
  children: React.ReactNode
}

const InfoCardGrid = (props: InfoCardGridProps) => (
  <section className="info-cards">
    <header className="info-cards__header">
      <Heading
        styleType={props.defaultHeadingStyle ? undefined : "underlineWeighted"}
        priority={2}
        className={"info-cards__title"}
      >
        {props.title}
      </Heading>
      {props.subtitle && <p className="info-cards__subtitle">{props.subtitle}</p>}
    </header>
    <div className="info-cards__grid">{props.children}</div>
  </section>
)

export { InfoCardGrid as default, InfoCardGrid }
