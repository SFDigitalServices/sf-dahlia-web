import React from "react"
import { Toast as SeedsToast } from "@bloom-housing/ui-seeds"
import { CommonMessageVariant } from "@bloom-housing/ui-seeds/src/blocks/shared/CommonMessage"
import "./Toast.scss"

interface ToastProps {
  children: React.ReactNode
  variant?: CommonMessageVariant
}

type SeedsToastComponent = React.ComponentType<{
  variant: CommonMessageVariant
  children?: React.ReactNode
}>

const Toast = ({ children, variant = "success" }: ToastProps) =>
  React.createElement(SeedsToast as unknown as SeedsToastComponent, { variant }, children)

export default Toast
