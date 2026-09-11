import React from "react"
import { Toast as SeedsToast } from "@bloom-housing/ui-seeds"

interface SuccessToastProps {
  variant?: "success" | "error"
  children: React.ReactNode
}

type SeedsToastComponent = React.ComponentType<{
  variant: "success" | "error"
  children?: React.ReactNode
}>

const SuccessToast = ({ variant, children }: SuccessToastProps) =>
  React.createElement(
    SeedsToast as unknown as SeedsToastComponent,
    { variant: variant || "success" },
    children
  )

export default SuccessToast
