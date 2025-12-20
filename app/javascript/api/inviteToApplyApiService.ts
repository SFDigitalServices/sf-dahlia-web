import { post } from "./apiService"

export const submitInviteToApplyResponse = async (applicationNumber: string) => {
  return post("/api/v1/invite-to-apply/submit", { application_number: applicationNumber })
}

export const recordResponse = async (
  record: {
    listingId: string,
    applicationNumber: string,
    deadline: string,
    response: string,
  }
) => {
  return post("/api/v1/invite-to-apply/record-response", { record })
}

