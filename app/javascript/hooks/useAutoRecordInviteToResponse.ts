import { useEffect } from "react"
import { recordResponse } from "../api/inviteToApiService"

const INTERACTION_EVENTS = [
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
] as const

export type ClientRecordingMode = "off" | "shadow" | "on"

interface UseAutoRecordInviteToResponseArgs {
  // "on" fires the real recordResponse; "shadow" fires a log-only call (server still records on GET).
  mode?: ClientRecordingMode
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  deadline?: string
  type?: string
  dwellMs?: number
}

/**
 * Automatically records an applicant's response to an invite-to-apply/interview email link
 * once the page has genuinely been seen by a human, gating out email-scanner-bot prefetches.
 *
 * In `mode: "on"` it fires the real `recordResponse`; in `mode: "shadow"` it fires a log-only
 * `logHumanVerifiedClick` (the server still records on GET) so the detection can be measured
 * against live traffic. Fires exactly once when all of the following hold:
 *  - `enabled` is true (caller is responsible for computing this, including the
 *    client-recording mode, `act`, `isTest`, `documentsPath`, and deadline checks)
 *  - the document is visible
 *  - two animation frames have elapsed while visible (a real paint happened)
 *  - either a first user interaction occurs, or `dwellMs` of continuous visibility elapses
 *    (whichever comes first)
 */
export const useAutoRecordInviteToResponse = ({
  mode = "on",
  act,
  appId,
  deadline,
  type,
  dwellMs = 2000,
}: UseAutoRecordInviteToResponseArgs) => {
  useEffect(() => {
    // Set when the fire conditions actually arm (after the render gate, while visible), so
    // elapsedMs reflects visible dwell/interaction time and excludes hidden/background-tab time.
    let armedAt = 0
    let fired = false
    let dwellTimeoutId: ReturnType<typeof setTimeout> | null = null
    let visibilityRafId1: number | null = null
    let visibilityRafId2: number | null = null

    const clearDwellTimer = () => {
      if (dwellTimeoutId !== null) {
        clearTimeout(dwellTimeoutId)
        dwellTimeoutId = null
      }
    }

    const clearRenderGateFrames = () => {
      if (visibilityRafId1 !== null) {
        cancelAnimationFrame(visibilityRafId1)
        visibilityRafId1 = null
      }
      if (visibilityRafId2 !== null) {
        cancelAnimationFrame(visibilityRafId2)
        visibilityRafId2 = null
      }
    }

    const removeInteractionListeners = () => {
      INTERACTION_EVENTS.forEach((eventName) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutually recursive with fire()
        window.removeEventListener(eventName, handleInteraction)
      })
    }

    const cleanup = () => {
      clearDwellTimer()
      clearRenderGateFrames()
      removeInteractionListeners()
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- registered further down
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }

    const fire = (trigger: "interaction" | "dwell") => {
      if (fired) return
      fired = true
      cleanup()
      const elapsedMs = Date.now() - armedAt
      const request =
        mode === "shadow"
          ? recordResponse({
              appId,
              deadline,
              action: act,
            })
          : recordResponse({
              appId,
              deadline,
              action: act,
            })
      void request.catch((error) => {
        console.error("Error auto-recording invite-to response:", error)
      })
    }

    const handleInteraction = () => {
      fire("interaction")
    }

    const armFireConditions = () => {
      armedAt = Date.now()
      INTERACTION_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, handleInteraction, { passive: true, once: true })
      })
      dwellTimeoutId = setTimeout(() => {
        fire("dwell")
      }, dwellMs)
    }

    const startRenderGate = () => {
      visibilityRafId1 = requestAnimationFrame(() => {
        visibilityRafId2 = requestAnimationFrame(() => {
          if (document.visibilityState === "visible") {
            armFireConditions()
          }
        })
      })
    }

    const handleVisibilityChange = () => {
      if (fired) return
      if (document.visibilityState === "visible") {
        clearRenderGateFrames()
        startRenderGate()
      } else {
        // Page hidden again before firing - pause/reset everything.
        clearRenderGateFrames()
        clearDwellTimer()
        removeInteractionListeners()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    if (document.visibilityState === "visible") {
      startRenderGate()
    }

    return cleanup
  }, [mode, act, appId, deadline, type, dwellMs])
}

export default useAutoRecordInviteToResponse
