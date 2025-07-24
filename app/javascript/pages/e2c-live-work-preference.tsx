import React from "react"
import { ApplicationData } from "./wizard"

interface Props {
  applicationData: ApplicationData
  nextPage: () => void
  prevPage: () => void
  saveData: (data: Inputs) => void
}

interface Inputs {
  "claim-preference": boolean
  "no-preference": boolean
  "choose-preference": boolean
  "preference-option"?: string
  "live-in-sf-member"?: string
  "live-in-sf-doctype"?: string
  "work-in-sf-member"?: string
  "work-in-sf-doctype"?: string
}

const E2cLiveWorkPreference = (_props: Props) => {
  return <div />
}

export default E2cLiveWorkPreference
