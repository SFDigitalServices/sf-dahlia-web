import React from "react"
import { Toast as SeedsToast } from "@bloom-housing/ui-seeds"

interface SuccessToastProps {
  children: React.ReactNode
}

type SeedsToastComponent = React.ComponentType<{
  variant: "success"
  children?: React.ReactNode
}>

const SuccessToast = ({ children }: SuccessToastProps) =>
  React.createElement(
    SeedsToast as unknown as SeedsToastComponent,
    { variant: "success" },
    children
  )

export default SuccessToast
