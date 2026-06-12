// Vendored from @bloom-housing/ui-components src/actions/ExpandableContent.tsx
import React, { useState } from "react"

export enum Order {
  above = "above",
  below = "below",
}

type ExpandableContentProps = {
  children: React.ReactNode
  strings: {
    readMore?: string
    readLess?: string
    buttonAriaLabel?: string
  }
  className?: string
  order?: Order
}

const ExpandableContent = ({
  children,
  strings,
  className,
  order = Order.above,
}: ExpandableContentProps) => {
  const [isExpanded, setExpanded] = useState(false)
  const rootClassNames = className ? `${className}` : undefined

  return (
    <div className={rootClassNames}>
      {order === Order.above && <>{isExpanded && <div>{children}</div>}</>}
      <button
        type="button"
        className="button is-unstyled m-0 no-underline has-toggle"
        aria-expanded={isExpanded}
        onClick={() => {
          setExpanded(!isExpanded)
        }}
        aria-label={strings.buttonAriaLabel}
      >
        {isExpanded ? strings.readLess : strings.readMore}
      </button>
      {order === Order.below && <>{isExpanded && <div>{children}</div>}</>}
    </div>
  )
}

export { ExpandableContent as default, ExpandableContent }
