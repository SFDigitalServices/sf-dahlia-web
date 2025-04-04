import React, {
  Dispatch,
  forwardRef,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
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

export const MenuIntersectionObserver = forwardRef<
  MenuIntersectionObserverHandle,
  MenuIntersectionObserverProps
>((props, ref) => {
  const currentElement: MutableRefObject<null | Element> = useRef(null)
  const ratio: number = 0.6
  const docRef = useRef(document)
  const lastScrollY = useRef<number>(0)
  const scrollDirection = useRef<number>(1)
  const intersectionObservers = useRef<IntersectionObserver[]>([])
  const observedElements = useRef<ObservedElementsProps>({})
  const elementHeights = useRef<ElementHeightsProps>({})
  const resizeObserverRef: MutableRefObject<null | ResizeObserver> = useRef(null)

  const handleIntersectionEntries = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const pageHeaderEntries = entries.filter((e) => e.target.id === DIRECTORY_PAGE_HEADER)
      toggleNavBarBoxShadow(pageHeaderEntries)

      const sectionHeaderEntries = entries.filter(
        (e) => e.target.id !== DIRECTORY_PAGE_HEADER && e.isIntersecting
      )
      const newActiveItem: string = handleSectionHeaderEntries(
        sectionHeaderEntries,
        currentElement.current,
        scrollDirection
      )
      if (newActiveItem) {
        props.setActiveItem(newActiveItem)
      }
    },
    [props]
  )

  const addIntersectionObserver = useCallback(
    (element: Element) => {
      // create a different threshold and observer for each element, since they may have very different heights
      const threshold = Math.min(1, (window.innerHeight / element.clientHeight) * ratio)
      const observer = new IntersectionObserver(handleIntersectionEntries, { threshold })
      observer.observe(element)

      intersectionObservers.current.push(observer)
      elementHeights[element.id] = element.clientHeight
      if (resizeObserverRef.current) {
        resizeObserverRef.current.observe(element)
      }
    },
    [handleIntersectionEntries]
  )

  const initObservers = useCallback(() => {
    intersectionObservers.current.forEach((observer) => observer.disconnect())
    intersectionObservers.current = []
    resizeObserverRef.current.disconnect()

    for (const element of Object.values(observedElements.current)) {
      addIntersectionObserver(element)
    }
  }, [addIntersectionObserver])

  const addObservedElement = useCallback(
    (elem: Element): void => {
      if (elem && !(elem.id in observedElements)) {
        observedElements.current[elem.id] = elem
        addIntersectionObserver(elem)
      }
    },
    [addIntersectionObserver]
  )

  const handleResize = useCallback(
    (entries) => {
      window.requestAnimationFrame((): void | undefined => {
        for (const entry of entries) {
          const currentHeight = elementHeights[entry.target.id]
          const diff = Math.abs(entry.contentRect.height - currentHeight) / currentHeight

          if (diff > 0.02) {
            // the resized difference is big enough that we should reset the intersection ratios
            initObservers()

            return
          }
        }
      })
    },
    [initObservers]
  )

  useLayoutEffect(() => {
    docRef.current.addEventListener("scroll", () => {
      scrollDirection.current = window.scrollY > lastScrollY.current ? 1 : -1
      lastScrollY.current = window.scrollY
    })
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleResize)
    }
  }, [handleResize])

  useImperativeHandle(ref, () => ({
    addObservedElement,
  }))

  return null
})
