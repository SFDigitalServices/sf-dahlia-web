import React, { useState, useEffect } from "react"
import {
  TextInput,
  ErrorMessage,
  Button,
  Alert,
  FormGroup,
  Checkbox,
} from "@trussworks/react-uswds"

import { useForm } from "react-hook-form"

import type { ApplicationData } from "../wizard"

interface Props {
  applicationData: ApplicationData
  nextPage: () => void
  prevPage: () => void
  saveData: (data: Inputs) => void
}

interface Inputs {
  "first-name": string
  "middle-name": string
  "last-name": string
  "dob-month": string
  "dob-day": string
  "dob-year": string
  email: string
}

const B1Name = ({ applicationData, nextPage, prevPage, saveData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)

  const { register, errors, handleSubmit, watch, setValue, getValues } = useForm<Inputs>({
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      "first-name": applicationData["first-name"] || "",
      "middle-name": applicationData["middle-name"] || "",
      "last-name": applicationData["last-name"] || "",
      "dob-month": applicationData["dob-month"] || "",
      "dob-day": applicationData["dob-day"] || "",
      "dob-year": applicationData["dob-year"] || "",
      email: applicationData.email || "",
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

  const noEmail = watch("no-email", false)

  useEffect(() => {
    if (noEmail) {
      setValue("email", "")
    }
  })

  useEffect(() => console.log(getValues()))

  return (
    <div className="flex-col justify-items-center m-8">
      <Button type="button" unstyled onClick={prevPage}>
        back
      </Button>

      <h2>what's your name?</h2>
      {blockedAlert && (
        <Alert type="error" headingLevel="h4" onClick={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <p>your name</p>
        <FormGroup>
          <TextInput
            id="first-name"
            name="first-name"
            placeholder="first name"
            type="text"
            inputRef={register({ required: true, pattern: /^[A-Za-z]+$/ })}
            validationStatus={errors["first-name"] ? "error" : undefined}
          />
          {!!errors["first-name"] && <ErrorMessage>{errors["first-name"].type}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <TextInput
            id="middle-name"
            name="middle-name"
            placeholder="middle name (optional)"
            type="text"
            inputRef={register({ pattern: /^[A-Za-z]+$/ })}
            validationStatus={errors["middle-name"] ? "error" : undefined}
          />
          {!!errors["middle-name"] && <ErrorMessage>{errors["middle-name"].type}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <TextInput
            id="last-name"
            name="last-name"
            placeholder="last name"
            type="text"
            inputRef={register({ required: true, pattern: /^[A-Za-z]+$/ })}
            validationStatus={errors["last-name"] ? "error" : undefined}
          />
          {!!errors["last-name"] && <ErrorMessage>{errors["last-name"].type}</ErrorMessage>}
        </FormGroup>

        <p className="mt-8">your date of birth</p>
        <FormGroup>
          <div className="flex justify-between w-48">
            <div className="w-12">
              <TextInput
                id="dob-month"
                name="dob-month"
                placeholder="MM"
                type="number"
                inputRef={register({ required: true, pattern: /^\d{1,2}$/ })}
                validationStatus={errors["dob-month"] ? "error" : undefined}
              />
            </div>
            <div className="w-12">
              <TextInput
                id="dob-day"
                name="dob-day"
                placeholder="DD"
                type="number"
                inputRef={register({ required: true, pattern: /^\d{1,2}$/ })}
                validationStatus={errors["dob-day"] ? "error" : undefined}
              />
            </div>
            <div className="w-16">
              <TextInput
                id="dob-year"
                name="dob-year"
                placeholder="YYYY"
                type="number"
                inputRef={register({ required: true, pattern: /^\d\d\d\d$/ })}
                validationStatus={errors["dob-year"] ? "error" : undefined}
              />
            </div>
          </div>
          {(!!errors["dob-day"] || !!errors["dob-month"] || !!errors["dob-year"]) && (
            <ErrorMessage>invalid dob</ErrorMessage>
          )}
        </FormGroup>

        <p className="mt-8">your email address</p>
        <FormGroup>
          <TextInput
            id="email"
            name="email"
            placeholder="you@myemail.com"
            type="email"
            inputRef={register({ required: !noEmail, pattern: /^[^@]+@[^@]+\.[^@]+$/ })}
            validationStatus={errors.email ? "error" : undefined}
            disabled={noEmail}
          />
          {!!errors.email && <ErrorMessage>{errors.email.type}</ErrorMessage>}

          <Checkbox
            id="no-email"
            name="no-email"
            label="I don't have an email address"
            inputRef={register()}
          />
        </FormGroup>

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default B1Name
