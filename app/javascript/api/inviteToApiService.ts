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

export type HumanVerifiedTrigger = "interaction" | "dwell" | "teardown"

// Passive, cheap browser signals attached to every human-verified log. Spoofable, so never used
// to gate/reject a click - only to classify the ambiguous "no signal" bucket after the fact
// (e.g. an in-app-webview human vs. a headless scanner).
export interface EnvSnapshot {
  webdriver: boolean // true => automation; a bot tell
  ua: string // in-app webviews self-identify: FBAN/Instagram/GSA/Outlook-iOS/...
  touch: number // navigator.maxTouchPoints
  coarse: boolean // matchMedia("(pointer: coarse)") => phone/tablet
  cores: number | null // hardwareConcurrency
  mem: number | null // deviceMemory (Chromium only)
  screen: string // `${w}x${h}@${dpr}`
  lang: string
  tz: string
}

// Reads a single env value, falling back when the property is missing or throws.
const safe = <T>(read: () => T, fallback: T): T => {
  try {
    return read() ?? fallback
  } catch {
    return fallback
  }
}

// Runs inside the fire path, so it must never throw: losing the signal to a telemetry error
// would defeat the point. Every lookup is individually guarded.
export const snapshotEnv = (): EnvSnapshot => {
  return {
    webdriver: safe(() => navigator.webdriver === true, false),
    ua: safe(() => navigator.userAgent, ""),
    touch: safe(() => navigator.maxTouchPoints, 0),
    // Note the trailing `?.matches`: matchMedia is absent in some webviews (and in jsdom), and
    // guarding only the call still throws when dereferencing the undefined result.
    coarse: safe(() => window.matchMedia?.("(pointer: coarse)")?.matches, false),
    cores: safe(() => navigator.hardwareConcurrency, null),
    mem: safe(() => (navigator as Navigator & { deviceMemory?: number }).deviceMemory, null),
    screen: safe(
      () => `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`,
      ""
    ),
    lang: safe(() => navigator.languages?.[0] ?? navigator.language, ""),
    tz: safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone, ""),
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
  env: EnvSnapshot
}

// Shadow-mode only: records nothing, just logs that client-side detection judged this a real
// human click. Used to measure the detection against live traffic before enabling client recording.
export const logHumanVerifiedClick = async (record: HumanVerifiedRecord) => {
  return post("/api/v1/next-steps/log-human-verified", { record })
}

// Teardown path: the page armed (painted + visible) but is unloading before the interaction/dwell
// gate completed - common in email in-app webviews that get torn down fast. sendBeacon survives
// unload where a fetch/XHR would be cancelled. Returns false if the browser refused to queue it.
export const beaconHumanVerifiedClick = (record: HumanVerifiedRecord): boolean => {
  if (typeof navigator.sendBeacon !== "function") return false
  const blob = new Blob([JSON.stringify({ record })], { type: "application/json" })
  return navigator.sendBeacon("/api/v1/next-steps/log-human-verified", blob)
}
