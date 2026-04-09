import { post } from "./apiService"

export const recordResponse = async (record: {
  listingId: string
  appId: string
  deadline: string
  action: string
  type: string
}) => {
  return post("/api/v1/next-steps/record-response", { record })
}
