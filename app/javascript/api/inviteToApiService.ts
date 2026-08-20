import { post } from "./apiService"

export const recordResponse = async (
  token: string,
  record: {
    listingId: string
    // most recent action taken (i.e. schedule appointment), rather than action originally specified in token (i.e. responded yes)
    action: string
  }
) => {
  if (!token) {
    throw new Error("Missing required token param: t")
  }

  return post("/api/v1/next-steps/record-response", {
    t: token,
    record,
  })
}

export type HumanVerifiedTrigger = "interaction" | "dwellTime" | "pageExit"

// Passive browser signals attached to every human-verified log. Spoofable, so evidence only -
// never a gate. Used to tell an in-app-webview human from a headless scanner after the fact.
// Keys mirror the browser APIs they come from, so the server-side allow-list is readable
// without cross-referencing this file.
export interface BrowserSnapshot {
  webdriver: boolean // true => automation; a bot tell
  userAgent: string // in-app webviews self-identify: FBAN/Instagram/GSA/Outlook-iOS/...
  maxTouchPoints: number
  coarsePointer: boolean // matchMedia("(pointer: coarse)") => phone/tablet
  cpuCores: number | null // navigator.hardwareConcurrency
  deviceMemory: number | null // Chromium only
  screen: string // `${w}x${h}@${dpr}`
  language: string
  timezone: string
}

// Reads a single value, falling back when the property is missing or throws.
const safe = <T>(read: () => T, fallback: T): T => {
  try {
    return read() ?? fallback
  } catch {
    return fallback
  }
}

// Runs inside the fire path, so every lookup is guarded individually - losing the signal to a
// telemetry error would defeat the point.
export const snapshotBrowser = (): BrowserSnapshot => {
  return {
    webdriver: safe(() => navigator.webdriver === true, false),
    userAgent: safe(() => navigator.userAgent, ""),
    maxTouchPoints: safe(() => navigator.maxTouchPoints, 0),
    // The trailing `?.matches` matters: matchMedia is absent in some webviews, where guarding
    // only the call still throws on the undefined result.
    coarsePointer: safe(() => window.matchMedia?.("(pointer: coarse)")?.matches, false),
    cpuCores: safe(() => navigator.hardwareConcurrency, null),
    deviceMemory: safe(
      () => (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      null
    ),
    screen: safe(
      () => `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`,
      ""
    ),
    language: safe(() => navigator.languages?.[0] ?? navigator.language, ""),
    timezone: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, ""),
  }
}

export interface HumanVerifiedRecord {
  listingId: string
  appId: string
  deadline: string
  act: string
  type: string
  trigger: HumanVerifiedTrigger
  elapsedMs: number
  browser: BrowserSnapshot
}

// Shadow mode: records nothing, only logs that client-side detection judged this a human click.
export const logHumanVerifiedClick = async (record: HumanVerifiedRecord) => {
  return post("/api/v1/next-steps/log-human-verified", { record })
}

// Page-exit path: sendBeacon is queued by the browser and survives page dismissal, where a
// fetch would be cancelled. Returns false if the browser refused to queue it.
export const beaconHumanVerifiedClick = (record: HumanVerifiedRecord): boolean => {
  if (typeof navigator.sendBeacon !== "function") return false
  const blob = new Blob([JSON.stringify({ record })], { type: "application/json" })
  return navigator.sendBeacon("/api/v1/next-steps/log-human-verified", blob)
}
