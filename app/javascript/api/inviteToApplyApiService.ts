import { get, post } from "./apiService"
import { Application } from "./types/rails/application/RailsApplication"

export const recordResponse = async (record: {
  listingId: string
  applicationNumber: string
  deadline: string
  response: string
}) => {
  return post("/api/v1/invite-to-apply/record-response", { record })
}

export const getApplication = async (id: string) =>
  get<{ data: Application }>(`/api/v1/short-form/application/${id}`).then((res) => res.data.data)
