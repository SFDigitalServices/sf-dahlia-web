import React from "react"
import { Toast as SeedsToast } from "@bloom-housing/ui-seeds"
import { CommonMessageVariant } from "@bloom-housing/ui-seeds/src/blocks/shared/CommonMessage"
import "./Toast.scss"

interface ToastProps {
  children: React.ReactNode
  variant?: CommonMessageVariant
  className?: string
}

type SeedsToastComponent = React.ComponentType<{
  variant: CommonMessageVariant
  className?: string
  children?: React.ReactNode
}>

const Toast = ({ children, variant = "success", className }: ToastProps) =>
  React.createElement(
    SeedsToast as unknown as SeedsToastComponent,
    { variant, className },
    children
  )

export default Toast
