// Vendored from @bloom-housing/ui-components src/sections/ResponsiveContentList.tsx,
// reimplemented without react-accessible-accordion. The mobile accordion
// mimics that library's markup (accordion / accordion__item / __heading /
// __button / __panel class names, button-role div, hidden panel) so the
// package's global accordion.scss styles keep applying.
import React, { createContext, useContext, useState } from "react"
import { Desktop, Mobile } from "./ResponsiveWrappers"

export interface ResponsiveContentProps {
  children: React.ReactNode
  desktopClass?: string
}

// Kept for API compatibility: react-accessible-accordion needed its uuid
// counter reset between tests; the native implementation has no global state.
const resetAccordionUuid = () => {
  // no-op
}

interface AccordionItemState {
  expanded: boolean
  toggle: () => void
  buttonId: string
  panelId: string
}

const AccordionItemContext = createContext<AccordionItemState>({
  expanded: false,
  toggle: () => {
    // no-op default
  },
  buttonId: "",
  panelId: "",
})

const ResponsiveContentList = (props: ResponsiveContentProps) => (
  <>
    <Mobile>
      <div className="accordion">{props.children}</div>
    </Mobile>
    <Desktop>
      <ul className="responsive-content-list">{props.children}</ul>
    </Desktop>
  </>
)

const MobileAccordionItem = (props: ResponsiveContentProps) => {
  const [expanded, setExpanded] = useState(false)
  const id = React.useId()
  const state: AccordionItemState = {
    expanded,
    toggle: () => setExpanded((value) => !value),
    buttonId: `accordion__heading-${id}`,
    panelId: `accordion__panel-${id}`,
  }

  return (
    <AccordionItemContext.Provider value={state}>
      <div className="accordion__item">{props.children}</div>
    </AccordionItemContext.Provider>
  )
}

const ResponsiveContentItem = (props: ResponsiveContentProps) => (
  <>
    <Mobile>
      <MobileAccordionItem>{props.children}</MobileAccordionItem>
    </Mobile>
    <Desktop>
      <li className={"responsive-content-item " + (props.desktopClass || "")}>
        {props.children}
      </li>
    </Desktop>
  </>
)

const MobileAccordionItemHeading = (props: ResponsiveContentProps) => {
  const { expanded, toggle, buttonId, panelId } = useContext(AccordionItemContext)

  return (
    <div className="accordion__heading" role="heading" aria-level={2}>
      <div
        className="accordion__button"
        role="button"
        tabIndex={0}
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={expanded}
        aria-disabled={false}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggle()
          }
        }}
      >
        {props.children}
      </div>
    </div>
  )
}

const ResponsiveContentItemHeader = (props: ResponsiveContentProps) => (
  <>
    <Mobile>
      <MobileAccordionItemHeading>{props.children}</MobileAccordionItemHeading>
    </Mobile>
    <Desktop>{props.children}</Desktop>
  </>
)

const MobileAccordionItemPanel = (props: ResponsiveContentProps) => {
  const { expanded, buttonId, panelId } = useContext(AccordionItemContext)

  return (
    <div
      className="accordion__panel"
      id={panelId}
      aria-labelledby={buttonId}
      hidden={!expanded}
    >
      {props.children}
    </div>
  )
}

const ResponsiveContentItemBody = (props: ResponsiveContentProps) => (
  <>
    <Mobile>
      <MobileAccordionItemPanel>{props.children}</MobileAccordionItemPanel>
    </Mobile>
    <Desktop>{props.children}</Desktop>
  </>
)

export {
  ResponsiveContentList,
  ResponsiveContentItem,
  ResponsiveContentItemHeader,
  ResponsiveContentItemBody,
  resetAccordionUuid,
}
