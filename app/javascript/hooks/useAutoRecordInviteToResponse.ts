import { useEffect } from "react"
import { logHumanVerifiedClick } from "../api/inviteToApiService"
import { isDeadlinePassed } from "../util/listingUtil"

const INTERACTION_EVENTS = [
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
] as const

// 'shadow' is currently the only active mode: the server still records on GET and the client
// only logs its human-detection result. A client-records ('on') mode is deferred until
// https://github.com/SFDigitalServices/sf-dahlia-web/pull/2993 lands.
export type ClientRecordingMode = "off" | "shadow"

interface UseAutoRecordInviteToResponseArgs {
  enabled: boolean
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  listingId?: string
  deadline?: string
  type?: string
  dwellMs?: number
}

const AUTO_RECORD_ACTS = new Set(["yes", "no", "contact"])

/**
 * Detects whether an invite-to-apply/interview email link was opened by a human rather than
 * prefetched by an email-scanner bot, and logs the result (nothing is recorded to Salesforce -
 * the server still records on GET).
 *
 * Fires exactly once per mount when all of the following hold:
 *  - `enabled` is true (caller is responsible for computing this, including the
 *    client-recording mode, `act`, `isTest`, `documentsPath`, and deadline checks)
 *  - the document is visible
 *  - two animation frames have elapsed while visible (a real paint happened)
 *  - either a first user interaction occurs, or `dwellMs` of continuous visibility elapses
 *    (whichever comes first)
 *
 * There is deliberately no cross-mount/session dedup guard: this is log-only telemetry, and a
 * guard would hide repeat loads we want to see in the logs.
 */
export const useAutoRecordInviteToResponse = ({
  enabled,
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
      void logHumanVerifiedClick({
        appId,
        listingId,
        deadline,
        act,
        type,
        trigger,
        elapsedMs: Date.now() - armedAt,
      }).catch((error) => {
        console.error("Error logging human-verified invite-to click:", error)
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
  }, [enabled, act, appId, listingId, deadline, type, dwellMs])
}

export default useAutoRecordInviteToResponse
