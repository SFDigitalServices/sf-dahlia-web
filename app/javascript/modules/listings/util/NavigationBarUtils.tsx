import React, { ReactNode, useRef, useLayoutEffect, MutableRefObject } from "react"

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

export const handleSectionHeaderEntries = (entries, currentElement, scrollDirection) => {
  if (entries.length === 0) {
    return
  }

  const { target, intersectionRatio } = entries[0]
  const id = target.id

  if (
    !currentElement ||
    (id !== currentElement.id &&
      intersectionRatio &&
      // check that the new element is in the same direction the user is scrolling from the current one
      (target.offsetTop - currentElement.offsetTop) * scrollDirection > 0)
  ) {
    currentElement = target
    return id
  }
}

export const PageHeaderWithRef = ({
  children,
  addObservedElement,
}: {
  children: ReactNode
  addObservedElement: (elem: HTMLElement) => void
}) => {
  const container: MutableRefObject<null | HTMLDivElement> = useRef(null)

  useLayoutEffect(() => {
    addObservedElement(container.current)
  }, [addObservedElement])

  return (
    <div id="page-header" ref={container}>
      {children}
    </div>
  )
}
