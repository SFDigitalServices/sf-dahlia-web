import { post } from "./apiService"

export const recordResponse = async (record: {
  listingId: string
  applicationNumber: string
  deadline: string
  response: string
}) => {
  return post("/api/v1/invite-to-apply/record-response", { record })
}
