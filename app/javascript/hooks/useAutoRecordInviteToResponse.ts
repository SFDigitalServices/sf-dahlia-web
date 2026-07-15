import { useEffect } from "react"
import { recordResponse, logHumanVerifiedClick } from "../api/inviteToApiService"
import { isDeadlinePassed } from "../util/listingUtil"

const INTERACTION_EVENTS = [
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
] as const

export type ClientRecordingMode = "off" | "shadow" | "on"

interface UseAutoRecordInviteToResponseArgs {
  enabled: boolean
  // "on" fires the real recordResponse; "shadow" fires a log-only call (server still records on GET).
  mode?: ClientRecordingMode
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  listingId?: string
  deadline?: string
  type?: string
  dwellMs?: number
}

const AUTO_RECORD_ACTS = new Set(["yes", "no", "contact"])

// Shadow and on modes use distinct guard keys so a session that later flips from shadow to on
// still records for real (the shadow call must not block the real one).
const guardKey = (appId: string, act: string, mode: ClientRecordingMode) =>
  mode === "shadow" ? `i2x-shadow-${appId}-${act}` : `i2x-recorded-${appId}-${act}`

const isGuardSet = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "true"
  } catch {
    return false
  }
}

const setGuard = (key: string) => {
  try {
    sessionStorage.setItem(key, "true")
  } catch {
    // Ignore private-mode / storage-disabled failures; server-side dedup is the backstop.
  }
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
  enabled,
  mode = "on",
  act,
  appId,
  listingId,
  deadline,
  type,
  dwellMs = 2000,
}: UseAutoRecordInviteToResponseArgs) => {
  useEffect(() => {
    if (
      !enabled ||
      mode === "off" ||
      !act ||
      !AUTO_RECORD_ACTS.has(act) ||
      !appId ||
      !listingId ||
      !type ||
      !deadline ||
      isDeadlinePassed(deadline)
    ) {
      return undefined
    }

    const key = guardKey(appId, act, mode)
    if (isGuardSet(key)) {
      return undefined
    }

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
      setGuard(key)
      const elapsedMs = Date.now() - armedAt
      const request =
        mode === "shadow"
          ? logHumanVerifiedClick({
              appId,
              listingId,
              deadline,
              act,
              type,
              trigger,
              elapsedMs,
            })
          : recordResponse({
              appId,
              applicationNumber: appId,
              listingId,
              deadline,
              action: act,
              response: act,
              type,
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
  }, [enabled, mode, act, appId, listingId, deadline, type, dwellMs])
}

export default useAutoRecordInviteToResponse
