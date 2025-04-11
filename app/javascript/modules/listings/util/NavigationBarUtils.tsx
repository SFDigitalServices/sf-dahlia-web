import React, {
  Dispatch,
  forwardRef,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useRef,
  useCallback,
  useImperativeHandle,
  useEffect,
} from "react"

import { DIRECTORY_PAGE_HEADER } from "../../constants"

interface ObservedElementsProps {
  [key: string]: Element
}

interface ElementHeightsProps {
  [key: string]: number
}

export interface MenuIntersectionObserverHandle {
  addObservedElement: (elem) => void
}

let currentElement: HTMLElement
let lastScrollY: number = 0
let scrollDirection: number = 1
let intersectionObservers: IntersectionObserver[] = []
const observedElements: ObservedElementsProps = {}
export const elementHeights: ElementHeightsProps = {}
let resizeObserverRef: ResizeObserver

type MenuIntersectionObserverProps = {
  setActiveItem: Dispatch<SetStateAction<string>>
}

export const toggleNavBarBoxShadow = (pageHeaderEntries: IntersectionObserverEntry[]) => {
  const navBarContainer = document.querySelector("#nav-bar-container")
  if (navBarContainer) {
    navBarContainer.classList.toggle("directory-page-navigation-bar__header-intercept", false)

    if (pageHeaderEntries.length > 0 && pageHeaderEntries.every((e) => !e.isIntersecting)) {
      navBarContainer.classList.toggle("directory-page-navigation-bar__header-intercept", true)
    }
  }
}

export const handleSectionHeaderEntries = (entries) => {
  if (entries.length > 0) {
    const { target, intersectionRatio } = entries[0]

    if (
      !currentElement ||
      (target.id !== currentElement.id &&
        intersectionRatio &&
        // check that the new element is in the same direction the user is scrolling from the current one
        (target.offsetTop - currentElement.offsetTop) * scrollDirection > 0)
    ) {
      currentElement = target
      return target.id
    }
  }
}

const addIntersectionObserver = (element: Element, callback: (id: string) => void) => {
  if (element && !(element.id in observedElements)) {
    observedElements[element.id] = element

    // create a different threshold and observer for each element, since they may have very different heights
    const threshold = Math.min(1, (window.innerHeight / element.clientHeight) * 0.6)
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleIntersectionEntries = (entries: IntersectionObserverEntry[]) => {
      const pageHeaderEntries = entries.filter((e) => e.target.id === DIRECTORY_PAGE_HEADER)
      toggleNavBarBoxShadow(pageHeaderEntries)

      const sectionHeaderEntries = entries.filter(
        (e) => e.target.id !== DIRECTORY_PAGE_HEADER && e.isIntersecting
      )

      const newActiveItem: string = handleSectionHeaderEntries(sectionHeaderEntries)
      if (callback && newActiveItem) {
        callback(newActiveItem)
      }
    }
    const observer = new IntersectionObserver(handleIntersectionEntries, { threshold })
    observer.observe(element)

    intersectionObservers.push(observer)
    elementHeights[element.id] = element.clientHeight
    if (resizeObserverRef) {
      resizeObserverRef.observe(element)
    }
  }
}

const addScrollListener = () => {
  document.addEventListener("scroll", () => {
    if (window.scrollY !== lastScrollY) {
      scrollDirection = window.scrollY > lastScrollY ? 1 : -1
      lastScrollY = window.scrollY
    }
  })
}

export const initObservers = (callback: (id: string) => void) => {
  intersectionObservers.forEach((observer) => observer.disconnect())
  intersectionObservers = []
  resizeObserverRef.disconnect()

  for (const element of Object.values(observedElements)) {
    addIntersectionObserver(element, callback)
  }
}

const calculateHeightDifferenceRatio = (elem) => {
  const originalHeight = elementHeights[elem.target.id]
  return Math.abs(elem.contentRect.height - originalHeight) / originalHeight
}

export const handleResize = (entries, setActiveItem: (id: string) => void) => {
  window.requestAnimationFrame((): void | undefined => {
    for (const entry of entries) {
      if (calculateHeightDifferenceRatio(entry) > 0.02) {
        initObservers(setActiveItem)
        break
      }
    }
  })
}

export const PageHeaderWithRef = ({
  children,
  addObservedElement,
}: {
  children: ReactNode
  addObservedElement: (elem: HTMLElement) => void
}) => {
  const container: MutableRefObject<null | HTMLDivElement> = useRef(null)

  useEffect(() => {
    addObservedElement(container.current)
  }, [addObservedElement])

  return (
    <div id="page-header" ref={container}>
      {children}
    </div>
  )
}

export const MenuIntersectionObserver = forwardRef<
  MenuIntersectionObserverHandle,
  MenuIntersectionObserverProps
>((props, ref) => {
  const addObservedElement = useCallback(
    (elem: Element): void => {
      addIntersectionObserver(elem, props.setActiveItem)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  useEffect(() => {
    addScrollListener()
    if (!resizeObserverRef) {
      resizeObserverRef = new ResizeObserver((entries) => {
        handleResize(entries, props.setActiveItem)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    addObservedElement,
  }))

  return null
})
