// Vendored from @bloom-housing/ui-components src/actions/ExpandableText.tsx
import React, { useState } from "react"
import Markdown, { MarkdownToJSX } from "markdown-to-jsx"
import "./ExpandableText.css"

export interface ExpandableTextProps {
  children: string
  expand?: boolean
  maxLength?: number
  className?: string
  strings: {
    readMore: string
    readLess: string
    buttonAriaLabel?: string
  }
  markdownProps?: MarkdownToJSX.Options
  buttonClassName?: string
}

const getText = (text: string, expanded: boolean, maxLength: number) => {
  if (expanded || text.length <= maxLength) {
    return text
  }

  let position = maxLength
  while (text[position] != " " && position > 0) {
    position -= 1
  }
  return position > 0 ? text.slice(0, Math.max(0, position)) + "..." : text.slice(0, Math.max(0, maxLength)) + "..."
}

const moreLessButton = (
  expanded: boolean,
  setExpanded: (newValue: boolean) => void,
  strings: ExpandableTextProps["strings"],
  buttonClassName: ExpandableTextProps["buttonClassName"]
) => {
  const classes = ["button-toggle"]
  if (buttonClassName) {
    classes.push(buttonClassName)
  }

  return (
    <button
      className={classes.join(" ")}
      onClick={() => setExpanded(!expanded)}
      aria-label={strings.buttonAriaLabel}
      aria-expanded={expanded}
    >
      {expanded ? strings?.readLess : strings?.readMore}
    </button>
  )
}

const ExpandableText = (props: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(props.expand || false)
  const maxLength = props.maxLength || 350
  let button

  if (!props.children) return null

  if (props.children.length > maxLength) {
    button = moreLessButton(expanded, setExpanded, props.strings, props.buttonClassName)
  }
  return (
    <div className={`expandable-text ${props?.className || ""}`}>
      {" "}
      <Markdown options={props.markdownProps}>
        {getText(props.children, expanded, maxLength)}
      </Markdown>
      {button}
    </div>
  )
}

export { ExpandableText as default, ExpandableText }
