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

export const useAutoRecordInviteToResponse = ({
  mode = "off",
  act,
  appId,
  deadline,
  type,
  dwellMs = 2000,
}: UseAutoRecordInviteToResponseArgs) => {
  useEffect(() => {
    if (mode === "off") {
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

    const run = async () => {
      console.log(
        `useAutoRecordInviteToResponse received mode: ${mode}, act: ${act}, appId: ${appId}, deadline: ${deadline}, type: ${type}`
      )

      await recordResponse({
        appId,
        deadline,
        action: act,
      })
    }

    const fire = (trigger: "interaction" | "dwell") => {
      if (fired) return
      fired = true
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- registered further down
      cleanup()
      const elapsedMs = Date.now() - armedAt
      if (mode === "shadow") {
        console.log(
          `NOT RECORDING: appId = ${appId}, deadline = ${deadline}, act = ${act}, trigger = ${trigger}, elapsedMs = ${elapsedMs}`
        )
      } else {
        void run()
      }
    }

    const handleInteraction = () => {
      fire("interaction")
    }

    const removeInteractionListeners = () => {
      INTERACTION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleInteraction)
      })
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

    const cleanup = () => {
      clearDwellTimer()
      clearRenderGateFrames()
      removeInteractionListeners()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    if (document.visibilityState === "visible") {
      startRenderGate()
    }

    return cleanup
  }, [mode, act, appId, deadline, type, dwellMs])
}
