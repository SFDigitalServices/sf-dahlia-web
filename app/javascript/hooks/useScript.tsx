/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useEffect } from "react"

const useScript = (src) => {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState(src ? "loading" : "idle")
  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle")
        return
      }
      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      // TODO(DAH-1581): Remove any type on line 18
      let script: any = document.querySelector(`script[src="${src}"]`)
      if (!script) {
        // Create script
        script = document.createElement("script")
        script.src = src
        script.async = true
        // eslint-disable-next-line unicorn/prefer-dom-node-dataset
        script.setAttribute("data-status", "loading")
        // Add script to document body
        document.body.append(script)
        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          // eslint-disable-next-line unicorn/prefer-dom-node-dataset
          script.setAttribute("data-status", event.type === "load" ? "ready" : "error")
        }
        script.addEventListener("load", setAttributeFromEvent)
        script.addEventListener("error", setAttributeFromEvent)
      } else {
        // Grab existing script status from attribute and set to state.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setStatus(script.getAttribute("data-status"))
      }
      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error")
      }
      // Add event listeners
      script.addEventListener("load", setStateFromEvent)
      script.addEventListener("error", setStateFromEvent)
      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent)
          script.removeEventListener("error", setStateFromEvent)
        }
      }
    },
    [src] // Only re-run effect if script src changes
  )
  return status
}
export default useScript
