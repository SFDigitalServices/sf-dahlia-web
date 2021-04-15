import React, { createElement, FunctionComponent, useContext, useEffect, useState } from "react"

import {
  AlertTypes,
  AppearanceStyleType,
  Button,
  Modal,
  setSiteAlertMessage,
} from "@bloom-housing/ui-components"

import { UserContext } from "./UserContext"

const PROMPT_TIMEOUT = 60000
const events = ["mousemove", "keypress", "scroll"]

function useIdleTimeout(timeoutMs: number, onTimeout: () => void) {
  useEffect(() => {
    let timer: number
    const restartTimer = () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = (setTimeout(onTimeout, timeoutMs) as unknown) as number
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

export const IdleTimeout: FunctionComponent<IdleTimeoutProps> = (props: IdleTimeoutProps) => {
  const {
    promptTitle,
    promptAction,
    promptText,
    redirectPath,
    alertMessage,
    alertType = "alert",
    onTimeout,
  } = props

  // 5 minutes
  const idleTimeout = 5 * 60 * 1000
  const [promptTimeout, setPromptTimeout] = useState<number | undefined>()

  useIdleTimeout(idleTimeout, () => {
    // Clear any existing prompt timeouts
    if (promptTimeout) {
      clearTimeout(promptTimeout)
    }

    // Give the user 1 minute to respond to the prompt before the onTimeout action
    setPromptTimeout(
      (setTimeout(() => {
        const timeoutAction = async () => {
          setPromptTimeout(undefined)
          await onTimeout()
          setSiteAlertMessage(alertMessage, alertType)

          // replace this with proper react router when we have one
          return (window.location.href = redirectPath)
        }
        // eslint-disable-next-line no-void
        void timeoutAction()
      }, PROMPT_TIMEOUT) as unknown) as number
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

export const LoggedInUserIdleTimeout = ({ onTimeout }: { onTimeout?: () => unknown }) => {
  const { profile, signOut } = useContext(UserContext)

  const timeoutFxn = async () => {
    onTimeout && (await onTimeout())
    signOut && signOut()
  }

  // Only render the IdleTimeout component if the user is logged in
  return profile && signOut
    ? createElement(IdleTimeout, {
        promptTitle: "t.areYouStillWorking",
        promptText: "authentication.timeout.text",
        promptAction: "authentication.timeout.action",
        redirectPath: `/sign-in`,
        alertMessage: "authentication.timeout.signOutMessage",
        alertType: "notice",
        onTimeout: timeoutFxn,
      })
    : null
}
