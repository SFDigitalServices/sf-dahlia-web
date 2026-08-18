import { useEffect } from "react"
import {
  logHumanVerifiedClick,
  beaconHumanVerifiedClick,
  snapshotEnv,
  HumanVerifiedTrigger,
  HumanVerifiedRecord,
} from "../api/inviteToApiService"
import { isDeadlinePassed } from "../util/listingUtil"

// `pointerdown`/`pointermove` cover touch input too, so there is no separate `touchstart` here.
const INTERACTION_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll"] as const

// 'shadow' is currently the only active mode: the server still records on GET and the client
// only logs its human-detection result. A client-records ('on') mode is deferred until
// https://github.com/SFDigitalServices/sf-dahlia-web/pull/2993 lands.
export type ClientRecordingMode = "off" | "shadow"

interface UseAutoRecordInviteToResponseArgs {
  mode?: ClientRecordingMode
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  listingId?: string
  deadline?: string
  type?: string
  // Preview/test links and the documents page are page states that must never log.
  isTest?: boolean
  documentsPath?: boolean
  dwellTimeMs?: number
}

// Only these three arrive via the email links we're measuring; 'submit' and 'appointment' are
// on-page actions, not email clicks.
const AUTO_RECORD_ACTS = new Set(["yes", "no", "contact"])

/**
 * Detects whether an invite-to-apply/interview email link was opened by a human rather than
 * prefetched by an email-scanner bot, and logs the result (nothing is recorded to Salesforce -
 * the server still records on GET).
 *
 * Fires exactly once per mount when all of the following hold:
 *  - `mode` is not "off", the page is not a test/preview or documents view, and the params
 *    make up a complete, unexpired payload
 *  - the document is visible
 *  - a first paint has happened (see `afterFirstPaint`)
 *  - either a first user interaction occurs, or `dwellTimeMs` of continuous visibility
 *    elapses (whichever comes first)
 *
 * There is deliberately no cross-mount/session dedup guard: this is log-only telemetry, and a
 * guard would hide repeat loads we want to see in the logs.
 */
export const useAutoRecordInviteToResponse = ({
  mode = "off",
  act,
  appId,
  listingId,
  deadline,
  type,
  isTest = false,
  documentsPath = false,
  dwellTimeMs = 2000,
}: UseAutoRecordInviteToResponseArgs) => {
  useEffect(() => {
    if (
      mode === "off" ||
      isTest ||
      documentsPath ||
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

    // Set when the fire conditions actually arm (after the first paint, while visible), so
    // elapsedMs reflects visible dwell/interaction time and excludes hidden/background-tab time.
    let armedAt = 0
    // True once paint + visible are proven. Only then is a teardown worth reporting.
    let armed = false
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

    const cancelPendingFrames = () => {
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
      cancelPendingFrames()
      removeInteractionListeners()
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- registered in armFireConditions
      window.removeEventListener("pagehide", handlePageHide)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- registered further down
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }

    const buildRecord = (trigger: HumanVerifiedTrigger): HumanVerifiedRecord => ({
      appId,
      listingId,
      deadline,
      act,
      type,
      trigger,
      elapsedMs: Date.now() - armedAt,
      env: snapshotEnv(),
    })

    const fire = (trigger: "interaction" | "dwell") => {
      if (fired) return
      fired = true
      cleanup()
      void logHumanVerifiedClick(buildRecord(trigger)).catch((error) => {
        console.error("Error logging human-verified invite-to click:", error)
      })
    }

    // Flush on unload if we armed but never reached the stronger interaction/dwell gate -
    // the normal shape of an in-app email webview that gets torn down fast.
    const handlePageHide = () => {
      if (fired || !armed) return
      fired = true
      cleanup()
      const record = buildRecord("teardown")
      // If the browser won't queue the beacon, still try the normal request: it may not
      // survive an immediate unload, but a bfcache hide completes fine.
      if (!beaconHumanVerifiedClick(record)) {
        void logHumanVerifiedClick(record).catch(() => {
          // Nothing useful to do during teardown; the missing log line is the signal.
        })
      }
    }

    const handleInteraction = () => {
      fire("interaction")
    }

    const armFireConditions = () => {
      armed = true
      armedAt = Date.now()
      INTERACTION_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, handleInteraction, { passive: true, once: true })
      })
      // pagehide, not unload: it fires reliably in mobile webviews where the tab is killed.
      window.addEventListener("pagehide", handlePageHide, { once: true })
      dwellTimeoutId = setTimeout(() => {
        fire("dwell")
      }, dwellTimeMs)
    }

    // Waits for evidence the browser actually painted, which headless scanners often never do.
    // A rAF callback runs *before* the paint of its own frame, so one frame proves nothing;
    // the nested second frame resumes after the first was handed off for rendering. A
    // heuristic, not a guarantee - visibility and the interaction/dwell gate still have to pass.
    const afterFirstPaint = () => {
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
        cancelPendingFrames()
        afterFirstPaint()
      } else {
        // Hidden before firing - reset, and disarm so a later pagehide reports no teardown:
        // an unload from a hidden page is indistinguishable from a background prefetch.
        armed = false
        cancelPendingFrames()
        clearDwellTimer()
        removeInteractionListeners()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    if (document.visibilityState === "visible") {
      afterFirstPaint()
    }

    return cleanup
  }, [mode, act, appId, listingId, deadline, type, isTest, documentsPath, dwellTimeMs])
}

export default useAutoRecordInviteToResponse
