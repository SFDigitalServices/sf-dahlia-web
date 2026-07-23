import { post } from "./apiService"

export const recordResponse = async (record: {
  listingId: string
  appId: string
  applicationNumber: string
  deadline: string
  action: string
  response: string
  type: string
}) => {
  return post("/api/v1/next-steps/record-response", { record })
}

// Shadow-mode only: records nothing, just logs that client-side detection judged this a real
// human click. Used to measure the detection against live traffic before enabling client recording.
export const logHumanVerifiedClick = async (record: {
  listingId: string
  appId: string
  deadline: string
  act: string
  type: string
  trigger: string
  elapsedMs: number
}) => {
  return post("/api/v1/next-steps/log-human-verified", { record })
}
