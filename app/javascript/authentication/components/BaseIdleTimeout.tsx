import React, { FunctionComponent, useEffect, useState } from "react"

import { AlertTypes, AppearanceStyleType, Button } from "@bloom-housing/ui-components"
import { Dialog } from "@bloom-housing/ui-seeds"

const PROMPT_TIMEOUT = 60000
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
  onPrompt: () => unknown
  onTimeoutCancel?: () => unknown
}

const BaseIdleTimeout: FunctionComponent<IdleTimeoutProps> = (props: IdleTimeoutProps) => {
  const {
    promptTitle,
    promptAction,
    promptText,
    redirectPath,
    onTimeout,
    onTimeoutCancel,
    onPrompt,
  } = props

  // 30 minutes
  const idleTimeout = 30 * 60 * 1000
  const [promptTimeout, setPromptTimeout] = useState<number | undefined>()

  useIdleTimeout(idleTimeout, () => {
    // Clear any existing prompt timeouts
    if (promptTimeout) {
      clearTimeout(promptTimeout)
    }

    const timeoutAction = async () => {
      setPromptTimeout(undefined)
      await onTimeout()
      // replace this with proper react router when we have one
      return (window.location.href = redirectPath)
    }

    // Give the user 1 minute to respond to the prompt before the onTimeout action
    setPromptTimeout(() => {
      onPrompt()
      return setTimeout(() => {
        void timeoutAction()
      }, PROMPT_TIMEOUT) as unknown as number
    })
  })

  const modalActions = [
    <Button
      key="timeout-button"
      styleType={AppearanceStyleType.primary}
      onClick={() => {
        clearTimeout(promptTimeout)
        setPromptTimeout(undefined)
        onTimeoutCancel()
      }}
    >
      {promptAction}
    </Button>,
  ]
  return (
    <Dialog
      isOpen={Boolean(promptTimeout)}
      onClose={() => {
        clearTimeout(promptTimeout)
        setPromptTimeout(undefined)
        onTimeoutCancel()
      }}
    >
      <Dialog.Header>{promptTitle}</Dialog.Header>
      <Dialog.Content>{promptText}</Dialog.Content>
      <Dialog.Footer>{modalActions}</Dialog.Footer>
    </Dialog>
  )
}

export default BaseIdleTimeout
