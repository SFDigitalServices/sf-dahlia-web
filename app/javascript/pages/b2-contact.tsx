/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import { ApplicationData } from "./wizard"
import {
  Button,
  FieldError,
  Form,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectValue,
  TextField,
} from "react-aria-components"
import { Controller, useForm } from "react-hook-form"
import { Checkbox } from "./b1-name"

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
  "mail-address-city"?: string
  "mail-address-state"?: string
  "mail-address-zip"?: string
  "work-in-sf": string
}

const B2Contact = ({ nextPage, prevPage, saveData, applicationData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)
  const [noPhone, setNoPhone] = useState(!!applicationData["primary-phone"])
  const [showAdditionalPhone, setShowAdditionalPhone] = useState(
    !!applicationData["additional-phone"]
  )
  const [showMailAddress, setShowMailAddress] = useState(!!applicationData["mail-address-street"])

  const { control, handleSubmit, setValue, getValues } = useForm<Inputs>({
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      "primary-phone": applicationData["primary-phone"] || "",
      "primary-phone-type": applicationData["primary-phone-type"] || "",
      "additional-phone": applicationData["additional-phone"] || "",
      "additional-phone-type": applicationData["additional-phone-type"] || "",
      "address-street": applicationData["address-street"] || "",
      "address-unit": applicationData["address-unit"] || "",
      "address-city": applicationData["address-city"] || "",
      "address-state": applicationData["address-state"] || "",
      "address-zip": applicationData["address-zip"] || "",
      "mail-address-street": applicationData["mail-address-street"] || "",
      "mail-address-city": applicationData["mail-address-city"] || "",
      "mail-address-state": applicationData["mail-address-state"] || "",
      "mail-address-zip": applicationData["mail-address-zip"] || "",
      "work-in-sf": applicationData["work-in-sf"] || "",
    },
  })

  const phoneTypes = [
    { label: "What type of number is this?", value: "" },
    { label: "home", value: "home" },
    { label: "work", value: "work" },
    { label: "cell", value: "cell" },
  ]

  const addressStates = [
    { label: "Select one", value: "" },
    { label: "alabama", value: "AL" },
    { label: "alaska", value: "AK" },
    { label: "arizona", value: "AZ" },
  ]

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

  const handleChangeNoPhone = () => {
    const newNoPhone = !noPhone
    setNoPhone(newNoPhone)
    if (newNoPhone) setShowAdditionalPhone(false)
    setValue("primary-phone", "")
    setValue("primary-phone-type", "")
    setValue("additional-phone", "")
    setValue("additional-phone-type", "")
  }

  const handleChangeShowAdditionalPhone = () => {
    setShowAdditionalPhone(!showAdditionalPhone)
  }

  const handleChangeShowMailAddress = () => {
    setShowMailAddress(!showMailAddress)
    setValue("mail-address-street", "")
    setValue("mail-address-city", "")
    setValue("mail-address-state", "")
    setValue("mail-address-zip", "")
  }

  useEffect(() => console.log(getValues()))

  return (
    <div className="flex-col justify-items-center m-8">
      <button className="button" type="button" onClick={prevPage}>
        back
      </button>

      <h2>
        Thanks, {applicationData["first-name"] || ""}. Now we need to know how to contact you.
      </h2>
      {blockedAlert && (
        <button onClick={() => setBlockedAlert(false)} className="error-message">
          You'll need to resolve any errors before moving on
        </button>
      )}

      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <Group className="flex flex-col gap-4">
          <Controller
            control={control}
            name="primary-phone"
            rules={{ required: !noPhone, pattern: /\d\d\d[- ]?\d\d\d[- ]?\d\d\d\d/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="tel"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>Your Phone Number</Label>
                <Input type="text" placeholder="555-555-5555" className="form-input my-2" />
                <FieldError className="error-message">invalid phone number</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="primary-phone-type"
            rules={{ required: !noPhone }}
            render={({ onChange, onBlur, name }, { invalid }) => (
              <Select
                isRequired
                name={name}
                onBlur={onBlur}
                onSelectionChange={onChange}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Button>
                  <SelectValue className="form-input" />
                </Button>
                <Popover>
                  <ListBox className="form-select">
                    {phoneTypes.map(({ label, value }) => (
                      <ListBoxItem key={value}>{label}</ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="noPhone"
            rules={{ required: false }}
            render={({ onBlur, value, name }) => (
              <Checkbox value={value} onChange={handleChangeNoPhone} onBlur={onBlur} name={name}>
                <Label className="mx-2">I don't have a telephone number</Label>
              </Checkbox>
            )}
          />

          <Controller
            control={control}
            name="showAdditionalPhone"
            rules={{ required: false }}
            render={({ onBlur, value, name }) => (
              <Checkbox
                value={value}
                onChange={handleChangeShowAdditionalPhone}
                onBlur={onBlur}
                name={name}
              >
                <Label className="mx-2"> I have an additional telephone number</Label>
              </Checkbox>
            )}
          />

          {showAdditionalPhone && (
            <fieldset>
              <Controller
                control={control}
                name="additional-phone"
                rules={{ required: showAdditionalPhone, pattern: /\d\d\d[- ]?\d\d\d[- ]?\d\d\d\d/ }}
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
                    <Label>Your additional phone number</Label>
                    <Input type="text" placeholder="555-555-5555" className="form-input my-2" />
                    <FieldError className="error-message">
                      invalid/missing additional telephone number
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="additional-phone-type"
                rules={{ required: showAdditionalPhone }}
                render={({ onChange, onBlur, name }, { invalid }) => (
                  <Select
                    name={name}
                    isRequired
                    onSelectionChange={onChange}
                    onBlur={onBlur}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Button>
                      <SelectValue />
                    </Button>
                    <FieldError className="error-message">
                      missing addditional telephone number type
                    </FieldError>

                    <Popover>
                      <ListBox>
                        {phoneTypes.map(({ label, value }) => (
                          <ListBoxItem id={value}>{label}</ListBoxItem>
                        ))}
                      </ListBox>
                    </Popover>
                  </Select>
                )}
              />
            </fieldset>
          )}

          <Controller
            control={control}
            name="address-street"
            rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="text"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>Address</Label>
                <Input placeholder="Street Address" className="form-input" />
                <FieldError className="error-message">invalid/missing street address</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="address-unit"
            rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="text"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>Apt or Unit #</Label>
                <Input placeholder="Apt or Unit #" className="form-input" />
                <FieldError className="error-message">invalid/missing apt or unit #</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="address-city"
            rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="text"
                className="my-2 flex flex-col"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>City name</Label>
                <Input placeholder="City Name" className="form-input" />
                <FieldError className="error-message">invalid/missing city name</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="address-state"
            rules={{ required: !noPhone }}
            render={({ onChange, onBlur, name }, { invalid }) => (
              <Select
                isRequired
                name={name}
                onBlur={onBlur}
                onSelectionChange={onChange}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Button className="form-input">
                  <SelectValue />
                </Button>
                <FieldError className="error-message">missing state</FieldError>

                <Popover>
                  <ListBox className="form-select">
                    {addressStates.map(({ label, value }) => (
                      <ListBoxItem id={value}>{label}</ListBoxItem>
                    ))}
                  </ListBox>
                </Popover>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="address-zip"
            rules={{ required: true, pattern: /^\d{5}$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <TextField
                type="number"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>Zip Code</Label>
                <Input placeholder="Zip Code" className="form-input" />
                <FieldError className="error-message">invalid/missing zip</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="showMailAddress"
            rules={{ required: false }}
            render={({ onBlur, value, name }) => (
              <Checkbox
                value={value}
                onChange={handleChangeShowMailAddress}
                onBlur={onBlur}
                name={name}
              >
                <Label className="mx-2">Send my mail to a different address</Label>
              </Checkbox>
            )}
          />

          {showMailAddress && (
            <>
              <Controller
                control={control}
                name="mail-address-street"
                rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <TextField
                    type="text"
                    className="my-2 flex flex-col"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Label>Address</Label>
                    <Input placeholder="Street Address" className="w-16 form-input" />
                    <FieldError className="error-message">
                      invalid/missing street address
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="mail-address-unit"
                rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <TextField
                    type="text"
                    className="my-2 flex flex-col"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Label>Apt or Unit #</Label>
                    <Input placeholder="Apt or Unit #" className="w-16 form-input" />
                    <FieldError className="error-message">invalid/missing apt or unit #</FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="mail-address-city"
                rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <TextField
                    type="text"
                    className="my-2 flex flex-col"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Label>City name</Label>
                    <Input placeholder="City Name" className="w-16 form-input" />
                    <FieldError className="error-message">invalid/missing city name</FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="mail-address-state"
                rules={{ required: !noPhone }}
                render={({ onChange, onBlur, name }, { invalid }) => (
                  <Select
                    isRequired
                    name={name}
                    onBlur={onBlur}
                    onSelectionChange={onChange}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Label>State</Label>
                    <Button>
                      <SelectValue>
                        {({ defaultChildren, isPlaceholder }) => {
                          return isPlaceholder ? <>Select one</> : defaultChildren
                        }}
                      </SelectValue>{" "}
                    </Button>
                    <FieldError className="error-message">missing state</FieldError>

                    <Popover>
                      <ListBox>
                        {addressStates.map(({ label, value }) => (
                          <ListBoxItem id={value}>{label}</ListBoxItem>
                        ))}
                      </ListBox>
                    </Popover>
                  </Select>
                )}
              />

              <Controller
                control={control}
                name="mail-address-zip"
                rules={{ required: true, pattern: /^\d{5}$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <TextField
                    type="number"
                    className="form-input my-2"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Label>Zip Code</Label>
                    <Input placeholder="Zip Code" className="w-16 form-input" />
                    <FieldError className="error-message">invalid/missing zip</FieldError>
                  </TextField>
                )}
              />
            </>
          )}

          <Controller
            control={control}
            name="work-in-sf"
            rules={{ required: false }}
            render={({ onChange, onBlur }, { invalid }) => (
              <RadioGroup
                onChange={onChange}
                onBlur={onBlur}
                validationBehavior="aria"
                isInvalid={invalid}
              >
                <Label>Do you work in San Francisco</Label>
                <Radio value="yes" className="form-radio">
                  Yes
                </Radio>
                <Radio value="no" className="form-radio">
                  No
                </Radio>
                <FieldError className="error-message">
                  Please select one of the options above
                </FieldError>
              </RadioGroup>
            )}
          />
        </Group>
      </Form>

      <button className="mt-8 button" type="submit">
        next
      </button>
    </div>
  )
}

export default B2Contact
