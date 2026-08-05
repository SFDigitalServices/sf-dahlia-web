import { useEffect } from "react"
import { recordResponse } from "../api/inviteToApiService"

export type ClientRecordingMode = "off" | "shadow" | "on"

interface UseAutoRecordInviteToResponseArgs {
  // "on" fires the real recordResponse; "shadow" fires a log-only call (server still records on GET).
  mode?: ClientRecordingMode
  act?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  deadline?: string
  type?: string
}

export const useAutoRecordInviteToResponse = ({
  mode = "off",
  act,
  appId,
  deadline,
  type,
}: UseAutoRecordInviteToResponseArgs) => {
  useEffect(() => {
    const run = async () => {
      console.log(
        `useAutoRecordInviteToResponse received mode: ${mode}, act: ${act}, appId: ${appId}, deadline: ${deadline}, type: ${type}`
      )

      await recordResponse({
        appId,
        deadline,
        action: act,
      })
    }

    void run()
  }, [mode, act, appId, deadline, type])
}
