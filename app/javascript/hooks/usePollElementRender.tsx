import { useState, useEffect } from "react"

const usePollElementRender = (selector, disable) => {
  const [elementHasBeenRenderedStatus, setElementHasBeenRenderedStatus] = useState(false)

  useEffect(() => {
    if (disable) {
      setElementHasBeenRenderedStatus(false)
      return () => elementHasBeenRenderedStatus
    }
    /*
      This useEffect is checking for when an element get added to the dom
     */
    let iterations = 0

    /*
     * Poll every 1/3 second for 30 seconds checking for google translate to add language dropdown
     */
    const interval = setInterval(() => {
      iterations++
      const elementInDom = document.querySelector(selector)
      if (elementInDom && !elementHasBeenRenderedStatus) {
        setElementHasBeenRenderedStatus(true)
        clearInterval(interval)
      }
      if (iterations > 90) {
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return elementHasBeenRenderedStatus
}

export default usePollElementRender
