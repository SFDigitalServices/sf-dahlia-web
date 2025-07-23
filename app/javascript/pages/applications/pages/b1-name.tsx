import React, { useState, useEffect } from "react"
import { Alert, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Field } from "@bloom-housing/ui-components"
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
      <Button type="button" onClick={prevPage}>
        back
      </Button>

      <h2>what's your name?</h2>
      {blockedAlert && (
        <Alert variant="alert" onClose={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <p>your name</p>
        <CardSection>
          <Field
            id="first-name"
            name="first-name"
            placeholder="first name"
            type="text"
            validation={{ required: true, pattern: /^[A-Za-z]+$/ }}
            register={register}
            error={!!errors["first-name"]}
          />
          {!!errors["first-name"] && (
            <FormErrorMessage>{errors["first-name"].type}</FormErrorMessage>
          )}
        </CardSection>
        <CardSection>
          <Field
            id="middle-name"
            name="middle-name"
            placeholder="middle name (optional)"
            type="text"
            validation={{ pattern: /^[A-Za-z]+$/ }}
            register={register}
            error={!!errors["middle-name"]}
          />
          {!!errors["middle-name"] && (
            <FormErrorMessage>{errors["middle-name"].type}</FormErrorMessage>
          )}
        </CardSection>
        <CardSection>
          <Field
            id="last-name"
            name="last-name"
            placeholder="last name"
            type="text"
            validation={{ required: true, pattern: /^[A-Za-z]+$/ }}
            register={register}
            error={!!errors["last-name"]}
          />
          {!!errors["last-name"] && <FormErrorMessage>{errors["last-name"].type}</FormErrorMessage>}
        </CardSection>

        <p className="mt-8">your date of birth</p>
        <CardSection>
          <div className="flex justify-between w-48">
            <div className="w-12">
              <Field
                id="dob-month"
                name="dob-month"
                placeholder="MM"
                type="number"
                validation={{ required: true, pattern: /^\d{1,2}$/ }}
                register={register}
                error={!!errors["dob-month"]}
              />
            </div>
            <div className="w-12">
              <Field
                id="dob-day"
                name="dob-day"
                placeholder="DD"
                type="number"
                validation={{ required: true, pattern: /^\d{1,2}$/ }}
                register={register}
                error={!!errors["dob-day"]}
              />
            </div>
            <div className="w-16">
              <Field
                id="dob-year"
                name="dob-year"
                placeholder="YYYY"
                type="number"
                validation={{ required: true, pattern: /^\d\d\d\d$/ }}
                register={register}
                error={!!errors["dob-year"]}
              />
            </div>
          </div>
          {(!!errors["dob-day"] || !!errors["dob-month"] || !!errors["dob-year"]) && (
            <FormErrorMessage>invalid dob</FormErrorMessage>
          )}
        </CardSection>

        <p className="mt-8">your email address</p>
        <CardSection>
          <Field
            id="email"
            name="email"
            placeholder="you@myemail.com"
            type="email"
            validation={{ required: !noEmail, pattern: /^[^@]+@[^@]+\.[^@]+$/ }}
            disabled={noEmail}
            register={register}
            error={!!errors.email}
          />
          {!!errors.email && <FormErrorMessage>{errors.email.type}</FormErrorMessage>}

          <Field
            type="checkbox"
            id="no-email"
            name="no-email"
            label="I don't have an email address"
            register={register}
          />
        </CardSection>

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default B1Name
