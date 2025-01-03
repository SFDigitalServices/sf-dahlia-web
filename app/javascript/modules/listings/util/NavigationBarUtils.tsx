import React, { ReactNode } from "react"

export const toggleNavBarBoxShadow = (pageHeaderEntries: IntersectionObserverEntry[]) => {
  document
    .querySelector("#nav-bar-container")
    .classList.toggle("directory-page-navigation-bar__header-intercept", false)

  if (pageHeaderEntries.length > 0 && pageHeaderEntries.every((e) => !e.isIntersecting)) {
    document
      .querySelector("#nav-bar-container")
      .classList.toggle("directory-page-navigation-bar__header-intercept", true)
  }
}

export const handleSectionHeaderEntries = (sectionHeaderEntries: IntersectionObserverEntry[]) => {
  const rollup = sectionHeaderEntries.reduce(
    (acc, event) => {
      acc[event.target.id] = {
        intersecting: event.isIntersecting,
      }
      return acc
    },
    {
      "enter-a-lottery": false,
      "buy-now": false,
      "upcoming-lotteries": false,
      "lottery-results": false,
    }
  )

  for (const sectionHeader of [
    "lottery-results",
    "upcoming-lotteries",
    "buy-now",
    "enter-a-lottery",
  ]) {
    if (rollup[sectionHeader].intersecting) {
      return sectionHeader
    }
  }
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
