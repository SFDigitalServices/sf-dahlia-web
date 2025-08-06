import React, { useState, useEffect } from "react"

import { Alert, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Field, Select, Dropzone } from "@bloom-housing/ui-components"

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

  const { register, errors, handleSubmit, watch, setError, clearErrors, getValues, setValue } =
    useForm<Inputs>({
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

  return (
    <div className="flex-col justify-items-center m-8">
      <Button type="button" onClick={prevPage}>
        back
      </Button>

      <h2>
        Based on the addresses you entered, your household may qualify for the following lottery
        preferences.
      </h2>
      {blockedAlert && (
        <Alert variant="alert" onClose={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <p>If you have one of these lottery preferences, select it below:</p>

        {/****************************************************************************************************************************************************************************************
          claim preference */}

        <Field
          type="checkbox"
          id="claim-preference"
          name="claimPref"
          label="live or work in san francisco preference"
          register={register}
          onChange={handleChangeClaimPref}
        />

        {/****************************************************************************************************************************************************************************************
          preference option */}

        {claimPref && (
          <CardSection>
            <p>which preference option would you like to claim?</p>
            <Select
              id="preference-option"
              name="preference-option"
              validation={{ required: claimPref }}
              label="Select one"
              error={!!errors["preference-option"]}
              register={register}
              options={[
                { label: "Live in SF", value: "live-in-sf" },
                { label: "Work in SF", value: "work-in-sf" },
              ]}
            />
            {!!errors["preference-option"] && (
              <FormErrorMessage>{errors["preference-option"].type}</FormErrorMessage>
            )}
          </CardSection>
        )}

        {/****************************************************************************************************************************************************************************************
          live in sf */}

        {preferenceOption === "live-in-sf" && (
          <>
            <CardSection>
              <p>whose name is on the document you're uploading?</p>
              <Select
                id="live-in-sf-member"
                name="live-in-sf-member"
                validation={{ required: claimPref }}
                label="Select one"
                error={!!errors["live-in-sf-member"]}
                options={["household member 1", "household member 2"]}
              />
              {!!errors["live-in-sf-member"] && (
                <FormErrorMessage>{errors["live-in-sf-member"].type}</FormErrorMessage>
              )}
            </CardSection>
            <CardSection>
              <p>
                What type of document would you like to upload to show you live at that address?
              </p>
              <Select
                id="live-in-sf-doctype"
                name="live-in-sf-doctype"
                validation={{ required: claimPref }}
                label="Select one"
                error={!!errors["live-in-sf-doctype"]}
                options={["telephone bill", "cable and internet bill", "gas bill"]}
              />
              {!!errors["live-in-sf-doctype"] && (
                <FormErrorMessage>{errors["live-in-sf-doctype"].type}</FormErrorMessage>
              )}
            </CardSection>
            <CardSection>
              <Dropzone
                id="live-in-sf-proof"
                label="Upload proof of preference"
                uploader={() => {
                  alert("Uploader function called")
                }}
                accept="image/*"
              />
              {!!errors["live-in-sf-proof"] && (
                <FormErrorMessage>{errors["live-in-sf-proof"].type}</FormErrorMessage>
              )}
            </CardSection>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          work in sf */}

        {preferenceOption === "work-in-sf" && (
          <>
            <CardSection>
              <p>whose name is on the document you're uploading?</p>
              <Select
                id="work-in-sf-member"
                name="work-in-sf-member"
                validation={{ required: claimPref }}
                label="Select one"
                error={!!errors["work-in-sf-member"]}
                options={["household member 1", "household member 2"]}
              />
              {!!errors["work-in-sf-member"] && (
                <FormErrorMessage>{errors["work-in-sf-member"].type}</FormErrorMessage>
              )}
            </CardSection>
            <CardSection>
              <p>Which document are you uploading to prove eligibility?</p>
              <Select
                id="work-in-sf-doctype"
                name="work-in-sf-doctype"
                validation={{ required: claimPref }}
                label="Select one"
                error={!!errors["work-in-sf-doctype"]}
                options={["paystub with employer address", "letter from employer"]}
              />
              {!!errors["work-in-sf-doctype"] && (
                <FormErrorMessage>{errors["work-in-sf-doctype"].type}</FormErrorMessage>
              )}
            </CardSection>
            <CardSection>
              <Dropzone
                id="work-in-sf-proof"
                label="Upload proof of preference"
                uploader={() => {
                  alert("Uploader function called")
                }}
                accept="image/*"
              />
              {!!errors["work-in-sf-proof"] && (
                <FormErrorMessage>{errors["work-in-sf-proof"].type}</FormErrorMessage>
              )}
            </CardSection>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          no preference */}

        <Field
          type="checkbox"
          id="no-preference"
          className="mt-8"
          name="noPref"
          label="I don't want this lottery preference"
          register={register}
          onChange={handleChangeNoPref}
        />

        {!!errors["choose-preference"] && (
          <FormErrorMessage>{errors["choose-preference"].type}</FormErrorMessage>
        )}

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default E2cLiveWorkPreference
