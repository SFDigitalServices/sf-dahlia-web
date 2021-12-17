import { Icon, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import "./TextBanner.scss"

type TextBannerProps = {
  header: string
  content: string
}
const TextBanner = (props: TextBannerProps) => {
  return (
    <div className={"text-banner"}>
      <div className={"text-banner-inner"}>
        <Icon symbol="check" size={"large"} className={"text-banner-icon"} />
        <div className={"text-banner-content"}>
          <h2 className={"text-banner-header"}>{props.header}</h2>
          <p className={"text-banner-text"}>{props.content}</p>
        </div>
      </div>
    </div>
  )
}

export default TextBanner
