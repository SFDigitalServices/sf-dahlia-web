import { post } from "./apiService"
import { BrowserSnapshot } from "../util/browserSnapshotUtil"

export const recordResponse = async (
  token: string,
  record: {
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
