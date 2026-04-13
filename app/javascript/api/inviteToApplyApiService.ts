import { post } from "./apiService"

export const recordResponse = async (record: {
  listingId: string
  appId: string
  // Deprecated I2A pilot - remove in DAH-4045
  applicationNumber: string
  deadline: string
  action: string
  response: string
  type: string
}) => {
  return post("/api/v1/next-steps/record-response", { record })
}
