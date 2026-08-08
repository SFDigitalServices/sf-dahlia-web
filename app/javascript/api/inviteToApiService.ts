import { post } from "./apiService"

export const recordResponse = async (
  token: string,
  record: {
    appId: string
    deadline: string
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
