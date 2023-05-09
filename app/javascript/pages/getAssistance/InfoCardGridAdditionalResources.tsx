import { HeaderType, Heading } from "@bloom-housing/ui-components"
import * as React from "react"

export interface InfoCardGridProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  headingStyle?: HeaderType
  className?: string
}

const InfoCardGridAdditionalResources = (props: InfoCardGridProps) => (
  <section className={"info-cards mt-2"}>
    <header className="info-cards__header">
      <Heading
        styleType={props.headingStyle ? props.headingStyle : "underlineWeighted"}
        priority={2}
        className={props.className ? props.className : "text-sm"}
      >
        {props.title}
      </Heading>
      {props.subtitle && <p>{props.subtitle}</p>}
    </header>
    <div className="info-cards__grid mt-6 mb-8">{props.children}</div>
  </section>
)

export { InfoCardGridAdditionalResources as default, InfoCardGridAdditionalResources }
