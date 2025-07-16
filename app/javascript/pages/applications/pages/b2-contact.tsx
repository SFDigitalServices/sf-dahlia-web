import React, { useEffect, useState } from "react"
import {
  TextInput,
  Select,
  TextInputMask,
  ErrorMessage,
  Button,
  Alert,
  FormGroup,
  Checkbox,
  Radio,
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
      <Button type="button" unstyled onClick={prevPage}>
        back
      </Button>

      <h2>
        Thanks, {applicationData["first-name"] || ""}. Now we need to know how to contact you.
      </h2>
      {blockedAlert && (
        <Alert type="error" headingLevel="h4" onClick={() => setBlockedAlert(false)}>
          You'll need to resolve any errors before moving on
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/****************************************************************************************************************************************************************************************
          PHONE */}

        <FormGroup>
          <p>your phone number</p>
          <TextInputMask
            id="primary-phone"
            name="primary-phone"
            placeholder="555 555 5555"
            type="tel"
            mask="(___) ___-____"
            disabled={noPhone}
            inputRef={register({ required: !noPhone, pattern: /\(\d\d\d\) \d\d\d-\d\d\d\d/ })}
            validationStatus={errors["primary-phone"] ? "error" : undefined}
          />
          {!!errors["primary-phone"] && <ErrorMessage>{errors["primary-phone"].type}</ErrorMessage>}
        </FormGroup>
        <FormGroup>
          <Select
            id="primary-phone-type"
            name="primary-phone-type"
            disabled={noPhone}
            inputRef={register({ required: !noPhone })}
            validationStatus={errors["primary-phone-type"] ? "error" : undefined}
          >
            <option value="">What type of number is this?</option>
            <option value="home">home</option>
            <option value="work">work</option>
            <option value="cell">cell</option>
          </Select>
          {!!errors["primary-phone-type"] && (
            <ErrorMessage>{errors["primary-phone-type"].type}</ErrorMessage>
          )}
        </FormGroup>
        <Checkbox
          id="no-phone"
          name="no-phone"
          label="I don't have a telephone number"
          disabled={showAdditionalPhone}
          inputRef={register()}
        />

        {/****************************************************************************************************************************************************************************************
          PHONE 2 */}

        <Checkbox
          id="show-additional-phone"
          name="show-additional-phone"
          label="I have an additional telephone number"
          disabled={noPhone}
          inputRef={register()}
        />
        {showAdditionalPhone && (
          <>
            <FormGroup>
              <p>your second phone number</p>
              <TextInputMask
                id="additional-phone"
                name="additional-phone"
                placeholder="555 555 5555"
                type="tel"
                mask="(___) ___-____"
                inputRef={register({ required: true, pattern: /^\(\d\d\d\) \d\d\d-\d\d\d\d$/ })}
                validationStatus={errors["additional-phone"] ? "error" : undefined}
              />
              {!!errors["additional-phone"] && (
                <ErrorMessage>{errors["additional-phone"].type}</ErrorMessage>
              )}
            </FormGroup>
            <FormGroup>
              <Select
                id="additional-phone-type"
                name="additional-phone-type"
                inputRef={register({ required: true })}
                validationStatus={errors["additional-phone-type"] ? "error" : undefined}
              >
                <option value="">What type of number is this?</option>
                <option value="home">home</option>
                <option value="work">work</option>
                <option value="cell">cell</option>
              </Select>
              {!!errors["additional-phone-type"] && (
                <ErrorMessage>{errors["additional-phone-type"].type}</ErrorMessage>
              )}
            </FormGroup>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          ADDRESS */}

        <FormGroup>
          <p className="mt-8">address</p>
          <TextInput
            id="address-street"
            name="address-street"
            placeholder="street address"
            type="text"
            inputRef={register({ required: true, pattern: /^[A-Za-z0-9 -]+$/ })}
            validationStatus={errors["address-street"] ? "error" : undefined}
          />
          {!!errors["address-street"] && (
            <ErrorMessage>{errors["address-street"].type}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <p className="mt-4">apt or unit #</p>
          <TextInput
            id="address-unit"
            name="address-unit"
            placeholder="apt or unit #"
            type="text"
            inputRef={register({ pattern: /^[A-Za-z0-9 #]+$/ })}
            validationStatus={errors["address-unit"] ? "error" : undefined}
          />
          {!!errors["address-unit"] && <ErrorMessage>{errors["address-unit"].type}</ErrorMessage>}
        </FormGroup>

        <div className="flex">
          <FormGroup>
            <p>city name</p>
            <TextInput
              id="address-city"
              name="address-city"
              placeholder="city name"
              type="text"
              inputRef={register({ required: true, pattern: /^[A-Za-z -']+$/ })}
              validationStatus={errors["address-city"] ? "error" : undefined}
            />
            {!!errors["address-city"] && <ErrorMessage>{errors["address-city"].type}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <p>state</p>
            <Select
              id="address-state"
              name="address-state"
              inputRef={register({ required: true })}
              validationStatus={errors["address-state"] ? "error" : undefined}
            >
              <option value="">select one</option>
              <option value="alabama">alabama</option>
              <option value="alaska">alaska</option>
              <option value="arizona">arizona</option>
            </Select>
            {!!errors["address-state"] && (
              <ErrorMessage>{errors["address-state"].type}</ErrorMessage>
            )}
          </FormGroup>
        </div>

        <FormGroup>
          <p className="mt-4">zip</p>
          <TextInputMask
            id="address-zip"
            name="address-zip"
            placeholder="zipcode"
            type="text"
            mask="_____"
            inputRef={register({ required: true, pattern: /^\d{5}$/ })}
            validationStatus={errors["address-zip"] ? "error" : undefined}
          />
          {!!errors["address-zip"] && <ErrorMessage>{errors["address-zip"].type}</ErrorMessage>}
        </FormGroup>

        {/****************************************************************************************************************************************************************************************
          ADDRESS 2 */}

        <Checkbox
          id="show-mail-address"
          name="show-mail-address"
          label="send my mail to a different address"
          inputRef={register()}
        />
        {showMailAddress && (
          <>
            <FormGroup>
              <p className="mt-8">mailing address</p>
              <TextInput
                id="mail-address-street"
                name="mail-address-street"
                placeholder="street address"
                type="text"
                inputRef={register({ required: true, pattern: /^[A-Za-z0-9 -]+$/ })}
                validationStatus={errors["mail-address-street"] ? "error" : undefined}
              />
              {!!errors["mail-address-street"] && (
                <ErrorMessage>{errors["mail-address-street"].type}</ErrorMessage>
              )}
            </FormGroup>

            <div className="flex">
              <FormGroup>
                <p>city name</p>
                <TextInput
                  id="mail-address-city"
                  name="mail-address-city"
                  placeholder="city name"
                  type="text"
                  inputRef={register({ required: true, pattern: /^[A-Za-z -']+$/ })}
                  validationStatus={errors["mail-address-city"] ? "error" : undefined}
                />
                {!!errors["mail-address-city"] && (
                  <ErrorMessage>{errors["mail-address-city"].type}</ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <p>state</p>
                <Select
                  id="mail-address-state"
                  name="mail-address-state"
                  inputRef={register({ required: true })}
                  validationStatus={errors["mail-address-state"] ? "error" : undefined}
                >
                  <option value="">select one</option>
                  <option value="alabama">alabama</option>
                  <option value="alaska">alaska</option>
                  <option value="arizona">arizona</option>
                </Select>
                {!!errors["mail-address-state"] && (
                  <ErrorMessage>{errors["mail-address-state"].type}</ErrorMessage>
                )}
              </FormGroup>
            </div>

            <FormGroup>
              <p className="mt-4">zip</p>
              <TextInputMask
                id="mail-address-zip"
                name="mail-address-zip"
                placeholder="zipcode"
                type="text"
                mask="_____"
                inputRef={register({ required: true, pattern: /^\d{5}$/ })}
                validationStatus={errors["mail-address-zip"] ? "error" : undefined}
              />
              {!!errors["mail-address-zip"] && (
                <ErrorMessage>{errors["mail-address-zip"].type}</ErrorMessage>
              )}
            </FormGroup>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          Work in SF */}

        <FormGroup error={!!errors["work-in-sf"]}>
          <p className="mt-8">do you work in san francisco?</p>
          <Radio
            id="work-in-sf-yes"
            name="work-in-sf"
            label="yes"
            value="yes"
            inputRef={register({ required: true })}
          />
          <Radio
            id="work-in-sf-no"
            name="work-in-sf"
            label="no"
            value="no"
            inputRef={register({ required: true })}
          />
          {!!errors["work-in-sf"] && <ErrorMessage>{errors["work-in-sf"].type}</ErrorMessage>}
        </FormGroup>

        <Button className="mt-8" type="submit">
          next
        </Button>
      </form>
    </div>
  )
}

export default B2Contact
