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

const isElementInViewport = (elem: HTMLElement) => {
  if (elem) {
    const rect = elem.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight
    if (rect.top + elem.clientHeight > 0 && rect.top < viewportH) {
      return true
    }
  }
  return false
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

  const headers = ["enter-a-lottery", "buy-now", "upcoming-lotteries", "lottery-results"]
  for (const sectionHeader of headers) {
    if (rollup[sectionHeader].intersecting) {
      return sectionHeader
    }
  }

  // Edge case when user is scrolling and reverses direction in the middle of two sections
  // Iterate through the sections and return the first one in the viewport
  for (const sectionHeader of headers) {
    if (isElementInViewport(document.querySelector(`#${sectionHeader}`))) {
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
