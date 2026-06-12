// Vendored from @bloom-housing/ui-components src/page_components/listing/listing_sidebar/ExpandableSection.tsx
import * as React from "react"
import Markdown from "markdown-to-jsx"
import { ExpandableContent } from "./ExpandableContent"
import { Heading } from "./Heading"

export interface ExpandableSectionProps {
  content: string | React.ReactNode
  expandableContent?: string | React.ReactNode
  priority?: number
  strings: {
    title: string
    readMore?: string
    readLess?: string
    buttonAriaLabel?: string
  }
}

const ExpandableSection = ({
  content,
  expandableContent,
  priority,
  strings,
}: ExpandableSectionProps) => {
  if (!content) return null

  const getTextContent = (textContent: string | React.ReactNode) => {
    return (
      <>
        {typeof textContent === "string" ? (
          <Markdown options={{ disableParsingRawHTML: false }}>{textContent}</Markdown>
        ) : (
          textContent
        )}
      </>
    )
  }
  return (
    <section className="aside-block">
      <Heading priority={priority ?? 4} styleType={"underlineWeighted"}>
        {strings.title}
      </Heading>
      <div className="text-sm text-gray-750">
        {getTextContent(content)}
        {expandableContent && (
          <div className={"mt-2"}>
            <ExpandableContent
              strings={{
                readMore: strings.readMore,
                readLess: strings.readLess,
                buttonAriaLabel: strings.buttonAriaLabel,
              }}
            >
              {getTextContent(expandableContent)}
            </ExpandableContent>
          </div>
        )}
      </div>
    </section>
  )
}

export { ExpandableSection as default, ExpandableSection }
