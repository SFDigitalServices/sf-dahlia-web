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
