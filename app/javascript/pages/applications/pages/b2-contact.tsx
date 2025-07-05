import React, { useEffect, useState } from "react"

import { useForm } from "react-hook-form"

import type { ApplicationData } from "../wizard"

interface Props {
  applicationData: ApplicationData
  nextPage: () => void
  prevPage: () => void
  saveData: (data: Inputs) => void
}

interface Inputs {
  "primary-phone": string
  "primary-phone-type": string
  "no-phone": boolean
  "show-additional-phone": boolean
  "additional-phone"?: string
  "additional-phone-type"?: string
  "address-street": string
  "address-unit": string
  "address-city": string
  "address-state": string
  "address-zip": string
  "show-mail-address": boolean
  "mail-address-street"?: string
  "mail-address-unit"?: string
  "mail-address-city"?: string
  "mail-address-state"?: string
  "mail-address-zip"?: string
  "work-in-sf": string
}

const B2Contact = ({ nextPage, prevPage, saveData, applicationData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)
  // const [showAdditionalPhone, setShowAdditionalPhone] = useState(false)
  // const [noPhone, setNoPhone] = useState(false)

  const { register, errors, handleSubmit, watch, setValue, getValues } = useForm<Inputs>({
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      "primary-phone": applicationData["primary-phone"] || "",
      "primary-phone-type": applicationData["primary-phone-type"] || "",
      "no-phone": applicationData["no-phone"] || false,
      "show-additional-phone": applicationData["show-additional-phone"] || false,
      "additional-phone": applicationData["additional-phone"] || "",
      "additional-phone-type": applicationData["additional-phone-type"] || "",
      "address-street": applicationData["address-street"] || "",
      "address-unit": applicationData["address-unit"] || "",
      "address-city": applicationData["address-city"] || "",
      "address-state": applicationData["address-state"] || "",
      "address-zip": applicationData["address-zip"] || "",
      "show-mail-address": applicationData["show-mail-address"] || false,
      "mail-address-street": applicationData["mail-address-street"] || "",
      "mail-address-unit": applicationData["mail-address-unit"] || "",
      "mail-address-city": applicationData["mail-address-city"] || "",
      "mail-address-state": applicationData["mail-address-state"] || "",
      "mail-address-zip": applicationData["mail-address-zip"] || "",
      "work-in-sf": applicationData["work-in-sf"] || "",
    },
  })

  const onSubmit = (data, e) => {
    console.log("b2-contact SUCCESS", data, e)
    setBlockedAlert(false)
    saveData(data)
    nextPage()
  }

  const onError = (errors, e) => {
    console.log("b2-contact ERROR", errors, e)
    setBlockedAlert(true)
  }

  const noPhone = watch("no-phone", false)
  const showAdditionalPhone = watch("show-additional-phone", applicationData["no-phone"] || false)
  const showMailAddress = watch("show-mail-address", applicationData["show-mail-address"] || false)

  useEffect(() => {
    if (noPhone) {
      setValue("primary-phone", "")
      setValue("primary-phone-type", "")
    }
  })

  useEffect(() => console.log(getValues()))

  return <div className="flex-col justify-items-center m-8" />
}

export default B2Contact
