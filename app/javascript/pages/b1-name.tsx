// import { useForm } from "react-hook-form"
import { useToggleState } from "react-stately"
import React, { useEffect, useState } from "react"
import { FieldError, Form, Input, Label, TextField } from "react-aria-components"
import { ApplicationData } from "./wizard"
import { useCheckbox } from "react-aria"
import type { AriaCheckboxProps } from "@react-types/checkbox"
import type { ToggleStateOptions } from "@react-stately/toggle"

import { Controller, useForm } from "react-hook-form"

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
  "no-email": boolean
}

interface CheckboxProps extends AriaCheckboxProps, ToggleStateOptions {
  children?: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((props, forwardedRef) => {
  const { children } = props
  const state = useToggleState(props)
  const ref = React.useRef<HTMLInputElement>(null)
  const { inputProps } = useCheckbox(props, state, ref)

  const inputRef = forwardedRef || ref

  return (
    <label style={{ display: "block" }}>
      <input {...inputProps} ref={inputRef} />
      {children}
    </label>
  )
})

const B1Name = ({ applicationData, nextPage, prevPage, saveData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)

  const formMethods = useForm<Inputs>({
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
      "no-email": false,
    },
  })

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, watch, setValue, getValues, control } = formMethods

  const onSubmit = (data: Inputs, e) => {
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
      <button className="button" type="button" onClick={prevPage}>
        back
      </button>

      <h2>what's your name?</h2>

      {blockedAlert && (
        <button onClick={() => setBlockedAlert(false)} className="error-message">
          You'll need to resolve any errors before moving on
        </button>
      )}

      <Form onSubmit={handleSubmit(onSubmit, onError)} className="my-2">
        <fieldset>
          <legend>Your Name</legend>
          <Controller
            control={control}
            name="first-name"
            rules={{ required: "Name is required.", pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input type="text" placeholder="First Name" className="form-input my-2" />
                <FieldError className="error-message">invalid/missing first name</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="middle-name"
            rules={{ required: "Name is required.", pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input type="text" placeholder="Middle Name" className="form-input my-2" />
                <FieldError className="error-message">invalid middle name</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="last-name"
            rules={{ required: "Name is required.", pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input type="text" placeholder="Last Name" className="form-input" />
                <FieldError className="error-message">invalid/missing last name</FieldError>
              </TextField>
            )}
          />
        </fieldset>

        <fieldset className="flex gap-6">
          <legend>Your Date of Birth</legend>
          <Controller
            control={control}
            name="dob-month"
            rules={{
              required: true,
              pattern: /^\d{1,2}$/,
            }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="number"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input placeholder="MM" className="w-12 form-input" />
                <FieldError className="error-message">invalid/missing dob</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="dob-day"
            rules={{
              required: true,
              pattern: /^\d{1,2}$/,
            }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="number"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input placeholder="DD" className="w-12 form-input" />
                <FieldError className="error-message">invalid/missing dob</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="dob-year"
            rules={{
              required: true,
              pattern: /^\d\d\d\d$/,
            }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="number"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Input placeholder="YYYY" className="w-16 form-input" />
                <FieldError className="error-message">invalid/missing dob</FieldError>
              </TextField>
            )}
          />
        </fieldset>

        <fieldset>
          <Controller
            control={control}
            name="email"
            rules={{ required: !noEmail, pattern: /^[^@]+@[^@]+\.[^@]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                className="my-2 flex flex-col"
                type="email"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
                isDisabled={noEmail}
              >
                <Label>Your email address</Label>
                <Input placeholder="sf@google.com" className="form-input" />
                <FieldError className="error-message">invalid/missing email</FieldError>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="no-email"
            rules={{ required: false }}
            render={({ onChange, onBlur, value, name }) => (
              <Checkbox value={value} onChange={onChange} onBlur={onBlur} name={name}>
                <Label className="mx-2">I don't have an email address</Label>
              </Checkbox>
            )}
          />
        </fieldset>

        <button className="mt-8 button" type="submit">
          next
        </button>
      </Form>
    </div>
  )
}

export default B1Name
