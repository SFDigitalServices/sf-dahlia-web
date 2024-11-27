import { Alert } from "@bloom-housing/ui-seeds"
import React, { useEffect, useState } from "react"

export type AlertTypes =
  | "primary"
  | "primary-inverse"
  | "success"
  | "success-inverse"
  | "alert"
  | "alert-inverse"
  | "warn"
  | "warn-inverse"
  | "secondary"
  | "secondary-inverse"

type SiteAlertProps = {
  type?: AlertTypes
  alertMessage?: {
    type: AlertTypes
    message: string
  }
}

export const setSiteAlertMessage = (message: string, type: AlertTypes) => {
  sessionStorage.setItem(`alert_message_${type}`, message)
}

export const clearSiteAlertMessage = (type: AlertTypes) => {
  sessionStorage.removeItem(`alert_message_${type}`)
}

export const SiteAlert = ({ type = "alert", alertMessage }: SiteAlertProps) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const storedMessage = sessionStorage.getItem(`alert_message_${type}`)

    if (storedMessage) {
      setMessage(storedMessage)
      setOpen(true)
      sessionStorage.removeItem(`alert_message_${type}`)
    }
  }, [type])

  useEffect(() => {
    if (alertMessage?.message) {
      setMessage(alertMessage?.message)
      setOpen(true)
    }
  }, [alertMessage])

  return open ? (
    <Alert onClose={() => setOpen(false)} variant={type} fullwidth>
      {message}
    </Alert>
  ) : null
}
