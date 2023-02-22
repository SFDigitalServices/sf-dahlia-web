/*
  This is a solution for truncating raw HTML markup strings that we receive
  from the salesforce listing API. The main use-case is currently the Additional
  Information section on listings
*/
import React from "react"
// import truncate from "truncate-html"
import { renderInlineMarkup } from "../util/languageUtil"

export interface TextTruncateProps {
  text: string
  className?: string
  buttonClassName?: string
}

/**
 * When a user translated a page with Google Translate, the untruncated text was not getting translated.
 * Therefore, we have decided to temporarily stop using the TextTruncation feature.
 * We have preserved the code for us to come back to at a later date.
 */
export const TextTruncate = ({ text, className }: TextTruncateProps) => {
  // const [isExpanded, setIsExpanded] = useState(false)

  // truncate.setup({ ellipsis: " ... ", length: 400, reserveLastWord: true, keepWhitespaces: true })
  // const truncatedText = text ? renderInlineMarkup(truncate(text)) : ""
  const untruncatedText = renderInlineMarkup(text)
  let wrapperClassNames = ["text-xs inline"]
  if (className) {
    wrapperClassNames = [...wrapperClassNames, className]
  }

  // let buttonClassNames = ["button-toggle ml-1"]

  // if (buttonClassName) {
  //   buttonClassNames = [...buttonClassNames, buttonClassName]
  // }

  return (
    <div className={wrapperClassNames.join(" ")}>
      {untruncatedText}
      {/* {isExpanded ? untruncatedText : truncatedText}
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
      )} */}
    </div>
  )
}
