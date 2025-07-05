import React, { useState, useEffect } from "react"
import {
  ErrorMessage,
  Button,
  Alert,
  FormGroup,
  Checkbox,
  Select,
  FileInput,
} from "@trussworks/react-uswds"

import { useForm, Controller } from "react-hook-form"

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

  const { control, register, errors, handleSubmit, watch, setError, clearErrors, getValues, setValue } = useForm<Inputs>(
    {
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
    }
  )

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
      <Button type="button" unstyled onClick={prevPage}>
        back
      </Button>

      <h2>
        Based on the addresses you entered, your household may qualify for the following lottery
        preferences.
      </h2>
      {blockedAlert && (
        <Alert type="error" headingLevel="h4" onClick={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <p>If you have one of these lottery preferences, select it below:</p>

        {/****************************************************************************************************************************************************************************************
          claim preference */}

        <Checkbox
          id="claim-preference"
          name="claim-preference"
          label="live or work in san francisco preference"
          checked={claimPref}
          onChange={handleChangeClaimPref}
        />

        {/****************************************************************************************************************************************************************************************
          preference option */}

        {claimPref && (
          <FormGroup>
            <p>which preference option would you like to claim?</p>
            <Select
              id="preference-option"
              name="preference-option"
              inputRef={register({ required: claimPref })}
              validationStatus={errors["preference-option"] ? "error" : undefined}
            >
              <option value="">Select one</option>
              <option value="live-in-sf">Live in san francisco</option>
              <option value="work-in-sf">Work in san francisco</option>
            </Select>
            {!!errors["preference-option"] && (
              <ErrorMessage>{errors["preference-option"].type}</ErrorMessage>
            )}
          </FormGroup>
        )}

        {/****************************************************************************************************************************************************************************************
          live in sf */}

        {preferenceOption === "live-in-sf" && (
          <>
            <FormGroup>
              <p>whose name is on the document you're uploading?</p>
              <Select
                id="live-in-sf-member"
                name="live-in-sf-member"
                inputRef={register({ required: claimPref })}
                validationStatus={errors["live-in-sf-member"] ? "error" : undefined}
              >
                <option value="">Select one</option>
                <option value="primary-member">
                  {applicationData["first-name"]} {applicationData["last-name"]}
                </option>
                <option value="hh-member-1">household member 1</option>
                <option value="hh-member-2">household member 2</option>
              </Select>
              {!!errors["live-in-sf-member"] && (
                <ErrorMessage>{errors["live-in-sf-member"].type}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <p>
                What type of document would you like to upload to show you live at that address?
              </p>
              <Select
                id="live-in-sf-doctype"
                name="live-in-sf-doctype"
                inputRef={register({ required: claimPref })}
                validationStatus={errors["live-in-sf-doctype"] ? "error" : undefined}
              >
                <option value="">Select one</option>
                <option value="telephone-bill">telephone bill</option>
                <option value="cable-and-internet-bill">cable and internet bill</option>
                <option value="gas-bill">gas bill</option>
              </Select>
              {!!errors["live-in-sf-doctype"] && (
                <ErrorMessage>{errors["live-in-sf-doctype"].type}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <p>Upload proof of preference</p>
              <Controller
                name="live-in-sf-proof"
                control={control}
                rules={{ required: claimPref }}
                render={(props, _meta) => <FileInput id="live-in-sf-proof" {...props} />}
              />
              {!!errors["live-in-sf-proof"] && (
                <ErrorMessage>{errors["live-in-sf-proof"].type}</ErrorMessage>
              )}
            </FormGroup>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          work in sf */}

        {preferenceOption === "work-in-sf" && (
          <>
            <FormGroup>
              <p>whose name is on the document you're uploading?</p>
              <Select
                id="work-in-sf-member"
                name="work-in-sf-member"
                inputRef={register({ required: claimPref })}
                validationStatus={errors["work-in-sf-member"] ? "error" : undefined}
              >
                <option value="">Select one</option>
                <option value="primary-member">
                  {applicationData["first-name"]} {applicationData["last-name"]}
                </option>
                <option value="hh-member-1">household member 1</option>
                <option value="hh-member-2">household member 2</option>
              </Select>
              {!!errors["work-in-sf-member"] && (
                <ErrorMessage>{errors["work-in-sf-member"].type}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <p>Which document are you uploading to prove eligibility?</p>
              <Select
                id="work-in-sf-doctype"
                name="work-in-sf-doctype"
                inputRef={register({ required: claimPref })}
                validationStatus={errors["work-in-sf-doctype"] ? "error" : undefined}
              >
                <option value="">Select one</option>
                <option value="paystub">paystub with employer address</option>
                <option value="letter-from-employer">letter from employer</option>
              </Select>
              {!!errors["work-in-sf-doctype"] && (
                <ErrorMessage>{errors["work-in-sf-doctype"].type}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <p>Upload proof of preference</p>
              <Controller
                name="work-in-sf-proof"
                control={control}
                rules={{ required: claimPref }}
                render={(props, _meta) => <FileInput id="work-in-sf-proof" {...props} />}
              />
              {!!errors["work-in-sf-proof"] && (
                <ErrorMessage>{errors["work-in-sf-proof"].type}</ErrorMessage>
              )}
            </FormGroup>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          no preference */}

        <Checkbox
          id="no-preference"
          className="mt-8"
          name="no-preference"
          label="I don't want this lottery preference"
          checked={noPref}
          onChange={handleChangeNoPref}
        />

        {!!errors["choose-preference"] && (
          <ErrorMessage>{errors["choose-preference"].type}</ErrorMessage>
        )}

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default E2cLiveWorkPreference
