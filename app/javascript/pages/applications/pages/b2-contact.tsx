import React, { useEffect, useState } from "react"
import { Alert, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Field, Select } from "@bloom-housing/ui-components"
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

  return (
    <div className="flex-col justify-items-center m-8">
      <Button type="button" onClick={prevPage}>
        back
      </Button>

      <h2>
        Thanks, {applicationData["first-name"] || ""}. Now we need to know how to contact you.
      </h2>
      {blockedAlert && (
        <Alert variant="alert" onClose={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/****************************************************************************************************************************************************************************************
          PHONE */}

        <CardSection>
          <p>your phone number</p>
          <Field
            id="primary-phone"
            name="primary-phone"
            placeholder="555 555 5555"
            type="tel"
            disabled={noPhone}
            validation={{ required: !noPhone, pattern: /\(\d\d\d\) \d\d\d-\d\d\d\d/ }}
            register={register}
            error={!!errors["primary-phone"]}
          />
          {!!errors["primary-phone"] && (
            <FormErrorMessage>{errors["primary-phone"].type}</FormErrorMessage>
          )}
        </CardSection>
        <CardSection>
          <Select
            id="primary-phone-type"
            name="primary-phone-type"
            disabled={noPhone}
            label="What type of number is this?"
            validation={{ required: !noPhone }}
            error={!!errors["primary-phone-type"]}
            options={["home", "work", "cell"]}
          />
          {!!errors["primary-phone-type"] && (
            <FormErrorMessage>{errors["primary-phone-type"].type}</FormErrorMessage>
          )}
        </CardSection>
        <Field
          type="checkbox"
          id="no-phone"
          name="no-phone"
          label="I don't have a telephone number"
          disabled={showAdditionalPhone}
          register={register}
          error={!!errors["no-phone"]}
        />

        {/****************************************************************************************************************************************************************************************
          PHONE 2 */}

        <Field
          type="checkbox"
          id="show-additional-phone"
          name="show-additional-phone"
          label="I have an additional telephone number"
          disabled={noPhone}
          register={register}
          error={!!errors["no-phone"]}
        />
        {showAdditionalPhone && (
          <>
            <CardSection>
              <p>your second phone number</p>
              <Field
                id="additional-phone"
                name="additional-phone"
                placeholder="555 555 5555"
                type="tel"
                validation={{ required: true, pattern: /^\(\d\d\d\) \d\d\d-\d\d\d\d$/ }}
                register={register}
                error={!!errors["additional-phone"]}
              />
              {!!errors["additional-phone"] && (
                <FormErrorMessage>{errors["additional-phone"].type}</FormErrorMessage>
              )}
            </CardSection>
            <CardSection>
              <Select
                id="additional-phone-type"
                name="additional-phone-type"
                validation={{ required: true }}
                disabled={noPhone}
                label="What type of number is this?"
                error={!!errors["additional-phone-type"]}
                options={["home", "work", "cell"]}
              />
              {!!errors["additional-phone-type"] && (
                <FormErrorMessage>{errors["additional-phone-type"].type}</FormErrorMessage>
              )}
            </CardSection>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          ADDRESS */}

        <CardSection>
          <p className="mt-8">address</p>
          <Field
            id="address-street"
            name="address-street"
            placeholder="street address"
            type="text"
            validation={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
            register={register}
            error={!!errors["address-street"]}
          />
          {!!errors["address-street"] && (
            <FormErrorMessage>{errors["address-street"].type}</FormErrorMessage>
          )}
        </CardSection>

        <CardSection>
          <p className="mt-4">apt or unit #</p>
          <Field
            id="address-unit"
            name="address-unit"
            placeholder="apt or unit #"
            type="text"
            validation={{ pattern: /^[A-Za-z0-9 #]+$/ }}
            register={register}
            error={!!errors["address-unit"]}
          />
          {!!errors["address-unit"] && (
            <FormErrorMessage>{errors["address-unit"].type}</FormErrorMessage>
          )}
        </CardSection>

        <div className="flex">
          <CardSection>
            <p>city name</p>
            <Field
              id="address-city"
              name="address-city"
              placeholder="city name"
              type="text"
              validation={{ required: true, pattern: /^[A-Za-z -']+$/ }}
              register={register}
              error={!!errors["address-city"]}
            />
            {!!errors["address-city"] && (
              <FormErrorMessage>{errors["address-city"].type}</FormErrorMessage>
            )}
          </CardSection>
          <CardSection>
            <p>state</p>
            <Select
              id="address-state"
              name="address-state"
              label="select one"
              validation={{ required: true }}
              error={!!errors["address-state"]}
              options={["alabama", "alaska", "arizona"]}
            />
            {!!errors["address-state"] && (
              <FormErrorMessage>{errors["address-state"].type}</FormErrorMessage>
            )}
          </CardSection>
        </div>

        <CardSection>
          <p className="mt-4">zip</p>
          <Field
            id="address-zip"
            name="address-zip"
            placeholder="zipcode"
            type="text"
            validation={{ required: true, pattern: /^\d{5}$/ }}
            register={register}
            error={!!errors["address-zip"]}
          />
          {!!errors["address-zip"] && (
            <FormErrorMessage>{errors["address-zip"].type}</FormErrorMessage>
          )}
        </CardSection>

        {/****************************************************************************************************************************************************************************************
          ADDRESS 2 */}

        <Field
          type="checkbox"
          id="show-mail-address"
          name="show-mail-address"
          label="send my mail to a different address"
          register={register}
          error={!!errors["show-mail-address"]}
        />
        {showMailAddress && (
          <>
            <CardSection>
              <p className="mt-8">mailing address</p>
              <Field
                id="mail-address-street"
                name="mail-address-street"
                placeholder="street address"
                type="text"
                validation={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
                register={register}
                error={!!errors["mail-address-street"]}
              />
              {!!errors["mail-address-street"] && (
                <FormErrorMessage>{errors["mail-address-street"].type}</FormErrorMessage>
              )}
            </CardSection>

            <div className="flex">
              <CardSection>
                <p>city name</p>
                <Field
                  id="mail-address-city"
                  name="mail-address-city"
                  placeholder="city name"
                  type="text"
                  validation={{ required: true, pattern: /^[A-Za-z -']+$/ }}
                  register={register}
                  error={!!errors["mail-address-city"]}
                />
                {!!errors["mail-address-city"] && (
                  <FormErrorMessage>{errors["mail-address-city"].type}</FormErrorMessage>
                )}
              </CardSection>
              <CardSection>
                <p>state</p>
                <Select
                  id="mail-address-state"
                  name="mail-address-state"
                  label="select one"
                  validation={{ required: true }}
                  error={!!errors["mail-address-state"]}
                  options={["alabama", "alaska", "arizona"]}
                />
                {!!errors["mail-address-state"] && (
                  <FormErrorMessage>{errors["mail-address-state"].type}</FormErrorMessage>
                )}
              </CardSection>
            </div>

            <CardSection>
              <p className="mt-4">zip</p>
              <Field
                id="mail-address-zip"
                name="mail-address-zip"
                placeholder="zipcode"
                type="text"
                validation={{ required: true, pattern: /^\d{5}$/ }}
                register={register}
                error={!!errors["mail-address-zip"]}
              />
              {!!errors["mail-address-zip"] && (
                <FormErrorMessage>{errors["mail-address-zip"].type}</FormErrorMessage>
              )}
            </CardSection>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          Work in SF */}

        <CardSection>
          <p className="mt-8">do you work in san francisco?</p>
          <Field
            type="radio"
            id="work-in-sf-yes"
            name="work-in-sf"
            label="yes"
            validation={{ required: true }}
            register={register}
            error={!!errors["work-in-sf"]}
          />
          <Field
            type="radio"
            id="work-in-sf-no"
            name="work-in-sf"
            label="no"
            validation={{ required: true }}
            register={register}
            error={!!errors["work-in-sf"]}
          />
          {!!errors["work-in-sf"] && (
            <FormErrorMessage>{errors["work-in-sf"].type}</FormErrorMessage>
          )}
        </CardSection>

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default B2Contact
