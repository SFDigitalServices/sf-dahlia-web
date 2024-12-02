import React, { FunctionComponent, useEffect, useState } from "react"

import { AlertTypes, AppearanceStyleType, Button, Modal, t } from "@bloom-housing/ui-components"
import { setSiteAlertMessage } from "../../components/SiteAlert"

const PROMPT_TIMEOUT = 3000 // TODO DAH-2880: 3 seconds, revert to 1 minute after PA testing
const events = ["mousemove", "keypress", "scroll"]

function useIdleTimeout(timeoutMs: number, onTimeout: () => void) {
  useEffect(() => {
    let timer: number = setTimeout(onTimeout, timeoutMs) as unknown as number
    const restartTimer = () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(onTimeout, timeoutMs) as unknown as number
    }

    // Listen for any activity events & reset the timer when they are found
    if (typeof document !== "undefined") {
      events.forEach((event) => document.addEventListener(event, restartTimer, false))
    }

    // Clean up our listeners & clear the timeout on unmounting/updating the effect
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      events.forEach((event) => document.removeEventListener(event, restartTimer, false))
    }
  }, [timeoutMs, onTimeout])
}

type IdleTimeoutProps = {
  promptTitle: string
  promptText: string
  promptAction: string
  redirectPath: string
  alertMessage: string
  alertType?: AlertTypes
  onTimeout: () => unknown
}

const BaseIdleTimeout: FunctionComponent<IdleTimeoutProps> = (props: IdleTimeoutProps) => {
  const { promptTitle, promptAction, promptText, redirectPath, onTimeout } = props

  // 30 minutes
  const idleTimeout = 3000 // TODO DAH-2880: 3 seconds, update to 30 minutes after PA testing
  const [promptTimeout, setPromptTimeout] = useState<number | undefined>()

  useIdleTimeout(idleTimeout, () => {
    // Clear any existing prompt timeouts
    if (promptTimeout) {
      clearTimeout(promptTimeout)
    }

    const timeoutAction = async () => {
      setPromptTimeout(undefined)
      await onTimeout()
      setSiteAlertMessage(t("signOut.alertMessage.timeout"), "secondary")
      // replace this with proper react router when we have one
      return (window.location.href = redirectPath)
    }

    // Give the user 1 minute to respond to the prompt before the onTimeout action
    setPromptTimeout(
      setTimeout(() => {
        void timeoutAction()
      }, PROMPT_TIMEOUT) as unknown as number
    )
  })

  const modalActions = [
    <Button
      styleType={AppearanceStyleType.primary}
      onClick={() => {
        clearTimeout(promptTimeout)
        setPromptTimeout(undefined)
      }}
    >
      {promptAction}
    </Button>,
  ]

  return (
    <Modal
      open={Boolean(promptTimeout)}
      title={promptTitle}
      ariaDescription={promptText}
      actions={modalActions}
      hideCloseIcon
    >
      {promptText}
    </Modal>
  )
}

export default BaseIdleTimeout
