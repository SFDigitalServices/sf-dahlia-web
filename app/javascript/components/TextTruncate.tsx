/*
  This is a solution for truncating raw HTML markup strings that we receive
  from the salesforce listing API. The main use-case is currently the Additional
  Information section on listings
*/
import React, { useState } from "react"
import { t } from "@bloom-housing/ui-components"
import truncate from "truncate-html"
import { renderInlineMarkup } from "../util/languageUtil"

export interface TextTruncateProps {
  text: string
  className?: string
  buttonClassName?: string
}

export const TextTruncate = ({ text, className, buttonClassName }: TextTruncateProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  truncate.setup({ ellipsis: " ... ", length: 400, reserveLastWord: true, keepWhitespaces: true })
  const truncatedText = text ? renderInlineMarkup(truncate(text)) : ""
  const untruncatedText = renderInlineMarkup(text)
  let wrapperClassNames = ["text-sm inline"]
  if (className) {
    wrapperClassNames = [...wrapperClassNames, className]
  }

  let buttonClassNames = ["button-toggle ml-1"]

  if (buttonClassName) {
    buttonClassNames = [...buttonClassNames, buttonClassName]
  }

  return (
    <div className={wrapperClassNames.join(" ")}>
      {isExpanded ? untruncatedText : truncatedText}
      {truncate(text)?.length !== text?.length && (
        <span
          className={buttonClassNames.join(" ")}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyPress={() => setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
        >
          {isExpanded ? t("label.less") : t("label.more")}
        </span>
      )}
    </div>
  )
}
