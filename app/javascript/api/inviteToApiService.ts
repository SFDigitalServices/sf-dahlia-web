import { post } from "./apiService"

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
