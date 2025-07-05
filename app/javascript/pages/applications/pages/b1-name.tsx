import React, { useState, useEffect } from "react"
import { Form } from "@base-ui-components/react/form"
import { Field } from "@base-ui-components/react/field"
import { Fieldset } from "@base-ui-components/react/fieldset"
import { Input } from "@base-ui-components/react/input"
import { Checkbox } from "@base-ui-components/react/checkbox"

import { useForm, Controller } from "react-hook-form"

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
  "no-email": boolean
}

const CheckIcon = () => (
  <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10">
    <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
  </svg>
)

const B1Name = ({ applicationData, nextPage, prevPage, saveData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)

  const { register, errors, handleSubmit, watch, setValue, getValues, control } = useForm<Inputs>({
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
      <button className="button" type="button" onClick={prevPage}>
        back
      </button>

      <h2>what's your name?</h2>
      {blockedAlert && (
        <p onClick={() => setBlockedAlert(false)} className="error-message">
          You'll need to resolve any errors before moving on
        </p>
      )}
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <Fieldset.Root className="my-2">
          <Fieldset.Legend>your name</Fieldset.Legend>
          <Controller
            control={control}
            name="first-name"
            rules={{ required: true, pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name, ref }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="text"
                  className="form-input my-2"
                  name={name}
                  placeholder="first name"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid/missing first name
                </Field.Error>
              </Field.Root>
            )}
          />
          <Controller
            control={control}
            name="middle-name"
            rules={{ pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="text"
                  className="form-input my-2"
                  name={name}
                  placeholder="middle name"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid middle name
                </Field.Error>
              </Field.Root>
            )}
          />
          <Controller
            control={control}
            name="last-name"
            rules={{ required: true, pattern: /^[A-Za-z]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="text"
                  className="form-input my-2"
                  name={name}
                  placeholder="last name"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid/missing last name
                </Field.Error>
              </Field.Root>
            )}
          />
        </Fieldset.Root>

        <Fieldset.Root>
          <Fieldset.Legend>your date of birth</Fieldset.Legend>
          <div className="flex justify-between w-48 my-2">
            <Controller
              control={control}
              name="dob-month"
              rules={{ required: true, pattern: /^\d{1,2}$/ }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root invalid={invalid}>
                  <Input
                    className="w-12 form-input"
                    name={name}
                    placeholder="MM"
                    type="number"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </Field.Root>
              )}
            />
            <Controller
              control={control}
              name="dob-day"
              rules={{ required: true, pattern: /^\d{1,2}$/ }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root invalid={invalid}>
                  <Input
                    className="w-12 form-input"
                    name={name}
                    placeholder="DD"
                    type="number"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </Field.Root>
              )}
            />
            <Controller
              control={control}
              name="dob-year"
              rules={{ required: true, pattern: /^[1-2][0,9][0-9][0-9]$/ }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root invalid={invalid}>
                  <Input
                    className="w-16 form-input"
                    name={name}
                    placeholder="YYYY"
                    type="number"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </Field.Root>
              )}
            />
          </div>
          {(!!errors["dob-day"] || !!errors["dob-month"] || !!errors["dob-year"]) && (
            <p className="error-message">invalid/missing dob</p>
          )}
        </Fieldset.Root>

        <Fieldset.Root>
          <Fieldset.Legend>your email address</Fieldset.Legend>
          <Controller
            control={control}
            name="email"
            rules={{ required: !noEmail, pattern: /^[^@]+@[^@]+\.[^@]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="email"
                  className="form-input my-2"
                  name={name}
                  placeholder="you@myemail.com"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  disabled={noEmail}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid/missing first name
                </Field.Error>
              </Field.Root>
            )}
          />
          <Controller
            control={control}
            name="no-email"
            render={({ onChange, onBlur, value, name }) => (
              <Field.Root name={name}>
                <Field.Label>
                  <Checkbox.Root
                    className="form-checkbox"
                    name={name}
                    value={value}
                    onBlur={onBlur}
                    onCheckedChange={onChange}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  I don't have an email address
                </Field.Label>
              </Field.Root>
            )}
          />
        </Fieldset.Root>

        <button className="mt-8 button" type="submit">
          next
        </button>
      </Form>
    </div>
  )
}

export default B1Name
