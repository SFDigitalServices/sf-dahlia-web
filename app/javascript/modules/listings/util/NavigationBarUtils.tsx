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

export const isElementInViewport = (elem: HTMLElement) => {
  if (elem) {
    const rect = elem.getBoundingClientRect()
    const viewportH = window.innerHeight || document.documentElement.clientHeight
    if (rect.top + elem.clientHeight > 0 && rect.top < viewportH) {
      return true
    }
  }
  return false
}

export const calculateViewportVisibility = (id: string) => {
  let result = 0
  const elem: HTMLElement = document.querySelector(`#${id}`)
  if (elem) {
    const windowHeight = window.innerHeight
    const docScroll = window.scrollY
    const elemPosition = elem.offsetTop
    const elemHeight = elem.offsetHeight
    const hiddenBefore = docScroll - elemPosition
    const hiddenAfter = elemPosition + elemHeight - (docScroll + windowHeight)

    if (docScroll > elemPosition + elemHeight || elemPosition > docScroll + windowHeight) {
      return 0
    } else {
      if ((hiddenBefore > 0 && hiddenAfter > 0) || (hiddenBefore <= 0 && hiddenAfter <= 0)) {
        result = 100
      }
      if (hiddenBefore > 0) {
        result = ((elemHeight - hiddenBefore) * 100) / windowHeight
      }

      if (hiddenAfter > 0) {
        result = ((elemHeight - hiddenAfter) * 100) / windowHeight
      }
    }
  }
  return result
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
