import React, { useState, useEffect } from "react"

import { useForm } from "react-hook-form"

import type { ApplicationData } from "../wizard"

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

const E2cLiveWorkPreference = ({ applicationData, nextPage, prevPage, saveData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)

  const [claimPref, setClaimPref] = useState(false)
  const [noPref, setNoPref] = useState(false)

  const {
    control,
    register,
    errors,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    getValues,
    setValue,
  } = useForm<Inputs>({
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      "claim-preference": applicationData["claim-preference"] || false,
      "no-preference": applicationData["no-preference"] || false,
      "choose-preference": false,
      "preference-option": applicationData["preference-option"] || "",
      "live-in-sf-member": applicationData["live-in-sf-member"] || "",
      "live-in-sf-doctype": applicationData["live-in-sf-doctype"] || "",
      "work-in-sf-member": applicationData["work-in-sf-member"] || "",
      "work-in-sf-doctype": applicationData["work-in-sf-doctype"] || "",
    },
  })

  const onSubmit = (data, e) => {
    console.log("e2c-live-work-preference SUCCESS", data, e)
    setBlockedAlert(false)
    saveData(data)
    nextPage()
  }

  const onError = (errors, e) => {
    console.log("e2c-live-work-preference ERROR", errors, e)
    setBlockedAlert(true)
  }

  // check one box unchecks the other
  // show error if both boxes are unchecked
  const handleChangeClaimPref = () => {
    const newClaimPref = !claimPref
    setValue("claim-preference", newClaimPref)
    setClaimPref(newClaimPref)
    if (newClaimPref) {
      setNoPref(false)
      setValue("no-preference", false)
    }
    if (!newClaimPref && !noPref) {
      setError("choose-preference", { type: "required" })
    } else {
      clearErrors("choose-preference")
    }
  }

  const handleChangeNoPref = () => {
    const newNoPref = !noPref
    setValue("no-preference", newNoPref)
    setNoPref(newNoPref)
    if (newNoPref) {
      setClaimPref(false)
      setValue("claim-preference", false)
    }
    if (!newNoPref && !claimPref) {
      setError("choose-preference", { type: "required" })
    } else {
      clearErrors("choose-preference")
    }
  }

  const preferenceOption = watch("preference-option")

  useEffect(() => console.log(getValues()))

  return <div className="flex-col justify-items-center m-8" />
}

export default E2cLiveWorkPreference
