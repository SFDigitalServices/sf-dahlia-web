/*
  This is a solution for truncating raw HTML markup strings that we receive
  from the salesforce listing API. The main use-case is currently the Additional
  Information section on listings
*/
import React, { useState } from "react"
import { t } from "@bloom-housing/ui-components"
import truncate from "truncate-html"
import { renderInlineWithInnerHTML } from "../util/languageUtil"
import { stripMostTags } from "../util/filterUtil"

export interface TextTruncateProps {
  text: string
}

export const TextTruncate = ({ text }: TextTruncateProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  truncate.setup({ ellipsis: " ... ", length: 400, reserveLastWord: true })
  const truncatedText = renderInlineWithInnerHTML(stripMostTags(truncate(text)))
  const untruncatedText = renderInlineWithInnerHTML(stripMostTags(text))

  return (
    <div className="text-sm">
      {isExpanded ? untruncatedText : truncatedText}
      {truncate(text)?.length !== text?.length && (
        <span
          className="button-toggle"
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
