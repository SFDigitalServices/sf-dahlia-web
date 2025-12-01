import { post } from "./apiService"

export const submitInviteToApplyResponse = async (applicationNumber: string) => {
  return post("/api/v1/invite-to-apply/submit", { application_number: applicationNumber })
}
