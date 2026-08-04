import { post } from "./apiService"

export const recordResponse = async (record: {
  appId: string
  deadline: string
  action: string
}) => {
  return post("/api/v1/next-steps/record-response", { record })
}
