// Passive browser signals captured when a human-verified invite-to click is logged.
// Deliberately not in inviteToApiService: nothing here talks to the API, it just reads the
// browser environment.
//
// Everything is spoofable, so these are evidence only - never a gate. They exist to tell an
// in-app-webview human from a headless scanner after the fact.
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
