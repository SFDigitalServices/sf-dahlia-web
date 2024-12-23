import React, { ReactNode } from "react"

export const toggleNavBarBoxShadow = (pageHeaderEvents: IntersectionObserverEntry[]) => {
  document
    .querySelector("#nav-bar-container")
    .classList.toggle("directory-page-navigation-bar__header-intercept", false)

  if (pageHeaderEvents.length > 0 && pageHeaderEvents.every((e) => !e.isIntersecting)) {
    document
      .querySelector("#nav-bar-container")
      .classList.toggle("directory-page-navigation-bar__header-intercept", true)
  }
}

export const handleSectionHeaderEvents = (
  sectionHeaderEvents: IntersectionObserverEntry[],
  prevActiveItem: string,
  setActiveItem: React.Dispatch<string>
) => {
  let newActiveItem = prevActiveItem

  let prevRatio = null
  for (const e of sectionHeaderEvents) {
    if (e.isIntersecting) {
      if (!prevRatio) {
        prevRatio = e.intersectionRatio
        newActiveItem = e.target.id
      } else if (e.intersectionRatio > prevRatio) {
        newActiveItem = e.target.id
      }
    }
  }

  setActiveItem(newActiveItem)
}

export const PageHeaderWithRef = ({
  children,
  observerRef,
}: {
  children: ReactNode
  observerRef: React.MutableRefObject<null | IntersectionObserver>
}) => {
  return (
    <div
      id="page-header"
      ref={(el) => {
        if (el) {
          observerRef?.current?.observe(el)
        }
      }}
    >
      {children}
    </div>
  )
}
