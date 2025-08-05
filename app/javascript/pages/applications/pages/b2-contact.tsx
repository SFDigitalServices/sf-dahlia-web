import React, { useEffect, useState } from "react"

import { Form } from "@base-ui-components/react/form"
import { Field } from "@base-ui-components/react/field"
import { Fieldset } from "@base-ui-components/react/fieldset"
import { Input } from "@base-ui-components/react/input"
import { Select } from "@base-ui-components/react/select"
import { Checkbox } from "@base-ui-components/react/checkbox"
import { Radio } from "@base-ui-components/react/radio"
import { RadioGroup } from "@base-ui-components/react/radio-group"

import { useForm, Controller } from "react-hook-form"

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
  "mail-address-city"?: string
  "mail-address-state"?: string
  "mail-address-zip"?: string
  "work-in-sf": string
}

const CheckIcon = () => (
  <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10">
    <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
  </svg>
)

const ChevronUpDownIcon = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentcolor" strokeWidth="1.5">
    <path d="M0.5 4.5L4 1.5L7.5 4.5" />
    <path d="M0.5 7.5L4 10.5L7.5 7.5" />
  </svg>
)

const B2Contact = ({ nextPage, prevPage, saveData, applicationData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)
  const [noPhone, setNoPhone] = useState(!!applicationData["primary-phone"])
  const [showAdditionalPhone, setShowAdditionalPhone] = useState(
    !!applicationData["additional-phone"]
  )
  const [showMailAddress, setShowMailAddress] = useState(!!applicationData["mail-address-street"])

  const { control, errors, handleSubmit, watch, setValue, getValues } = useForm<Inputs>({
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
        <p onClick={() => setBlockedAlert(false)} className="error-message">
          You'll need to resolve any errors before moving on
        </p>
      )}

      {/****************************************************************************************************************************************************************************************
          PHONE */}

      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <Fieldset.Root className="my-2">
          <Fieldset.Legend>your phone number</Fieldset.Legend>
          <Controller
            control={control}
            name="primary-phone"
            rules={{ required: !noPhone, pattern: /\d\d\d[- ]?\d\d\d[- ]?\d\d\d\d/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="tel"
                  className="form-input my-2"
                  name={name}
                  placeholder="555-555-5555"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  disabled={noPhone}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid/missing telephone number
                </Field.Error>
              </Field.Root>
            )}
          />
          <Controller
            control={control}
            name="primary-phone-type"
            rules={{ required: !noPhone }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root>
                <Select.Root
                  items={phoneTypes}
                  name={name}
                  value={value}
                  onValueChange={onChange}
                  disabled={noPhone}
                >
                  <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner className="form-select" sideOffset={8}>
                      <Select.ScrollUpArrow className="" />
                      <Select.Popup>
                        {phoneTypes.map(({ label, value }) => (
                          <Select.Item key={label} value={value} className="">
                            <Select.ItemIndicator className="">
                              <CheckIcon />
                            </Select.ItemIndicator>
                            <Select.ItemText className="">{label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
                <Field.Error className="error-message" match={invalid}>
                  missing telephone number type
                </Field.Error>
              </Field.Root>
            )}
          />
        </Fieldset.Root>

        <Field.Root name="noPhone">
          <Field.Label>
            <Checkbox.Root
              className="form-checkbox"
              checked={noPhone}
              onCheckedChange={handleChangeNoPhone}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            I don't have a telephone number
          </Field.Label>
        </Field.Root>

        {/****************************************************************************************************************************************************************************************
          PHONE 2 */}

        <Field.Root name="showAdditionalPhone">
          <Field.Label>
            <Checkbox.Root
              className="form-checkbox"
              checked={showAdditionalPhone}
              onCheckedChange={handleChangeShowAdditionalPhone}
              disabled={noPhone}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            I have an additional telephone number
          </Field.Label>
        </Field.Root>

        {showAdditionalPhone && (
          <Fieldset.Root className="my-2">
            <Fieldset.Legend>your second phone number</Fieldset.Legend>
            <Controller
              control={control}
              name="additional-phone"
              rules={{ required: showAdditionalPhone, pattern: /\d\d\d[- ]?\d\d\d[- ]?\d\d\d\d/ }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root invalid={invalid}>
                  <Input
                    type="tel"
                    className="form-input my-2"
                    name={name}
                    placeholder="555-555-5555"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  <Field.Error className="error-message" match={invalid}>
                    invalid/missing additional telephone number
                  </Field.Error>
                </Field.Root>
              )}
            />
            <Controller
              control={control}
              name="additional-phone-type"
              rules={{ required: showAdditionalPhone }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root>
                  <Select.Root
                    items={phoneTypes}
                    name={name}
                    value={value}
                    onValueChange={onChange}
                  >
                    <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner className="form-select">
                        <Select.ScrollUpArrow className="" />
                        <Select.Popup>
                          {phoneTypes.map(({ label, value }) => (
                            <Select.Item key={label} value={value} className="">
                              <Select.ItemIndicator className="">
                                <CheckIcon />
                              </Select.ItemIndicator>
                              <Select.ItemText className="">{label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                  <Field.Error className="error-message" match={invalid}>
                    missing additional telephone number type
                  </Field.Error>
                </Field.Root>
              )}
            />
          </Fieldset.Root>
        )}

        {/****************************************************************************************************************************************************************************************
          ADDRESS */}

        <Fieldset.Root className="my-2">
          <Fieldset.Legend>address</Fieldset.Legend>
          <Controller
            control={control}
            name="address-street"
            rules={{ required: true, pattern: /^[A-Za-z0-9 -]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="text"
                  className="form-input my-2"
                  name={name}
                  placeholder="street address"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid/missing street address
                </Field.Error>
              </Field.Root>
            )}
          />
        </Fieldset.Root>
        <Fieldset.Root className="my-2">
          <Fieldset.Legend>apt or unit #</Fieldset.Legend>
          <Controller
            control={control}
            name="address-unit"
            rules={{ pattern: /^[A-Za-z0-9 #]+$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="text"
                  className="form-input my-2"
                  name={name}
                  placeholder="apt or unit #"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  invalid apt or unit #
                </Field.Error>
              </Field.Root>
            )}
          />
        </Fieldset.Root>
        <div className="flex">
          <Fieldset.Root className="my-2">
            <Fieldset.Legend>city name</Fieldset.Legend>
            <Controller
              control={control}
              name="address-city"
              rules={{ required: true, pattern: /^[A-Za-z -']+$/ }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root invalid={invalid}>
                  <Input
                    type="text"
                    className="form-input my-2"
                    name={name}
                    placeholder="apt or unit #"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  <Field.Error className="error-message" match={invalid}>
                    missing/invalid city name
                  </Field.Error>
                </Field.Root>
              )}
            />
          </Fieldset.Root>
          <Fieldset.Root>
            <Fieldset.Legend>state</Fieldset.Legend>
            <Controller
              control={control}
              name="address-state"
              rules={{ required: true }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root>
                  <Select.Root
                    items={addressStates}
                    name={name}
                    value={value}
                    onValueChange={onChange}
                  >
                    <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner className="form-select">
                        <Select.ScrollUpArrow className="" />
                        <Select.Popup>
                          {addressStates.map(({ label, value }) => (
                            <Select.Item key={label} value={value} className="">
                              <Select.ItemIndicator className="">
                                <CheckIcon />
                              </Select.ItemIndicator>
                              <Select.ItemText className="">{label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                  <Field.Error className="error-message" match={invalid}>
                    missing state address
                  </Field.Error>
                </Field.Root>
              )}
            />
          </Fieldset.Root>
        </div>
        <Fieldset.Root className="my-2">
          <Fieldset.Legend>zip</Fieldset.Legend>
          <Controller
            control={control}
            name="address-zip"
            rules={{ required: true, pattern: /^\d{5}$/ }}
            render={({ onChange, onBlur, value, name }, { invalid }) => (
              <Field.Root invalid={invalid}>
                <Input
                  type="number"
                  className="form-input my-2"
                  name={name}
                  placeholder="zipcode"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <Field.Error className="error-message" match={invalid}>
                  missing/invalid zip
                </Field.Error>
              </Field.Root>
            )}
          />
        </Fieldset.Root>

        {/****************************************************************************************************************************************************************************************
          ADDRESS 2 */}

        <Field.Root name="showMailAddress">
          <Field.Label>
            <Checkbox.Root
              className="form-checkbox"
              checked={showMailAddress}
              onCheckedChange={handleChangeShowMailAddress}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            Send my mail to a different address
          </Field.Label>
        </Field.Root>
        {showMailAddress && (
          <>
            <Fieldset.Root className="my-2">
              <Fieldset.Legend>mailing address</Fieldset.Legend>
              <Controller
                control={control}
                name="mail-address-street"
                rules={{ required: showMailAddress, pattern: /^[A-Za-z0-9 -]+$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root invalid={invalid}>
                    <Input
                      type="text"
                      className="form-input my-2"
                      name={name}
                      placeholder="street address"
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <Field.Error className="error-message" match={invalid}>
                      invalid/missing street address
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
            <div className="flex">
              <Fieldset.Root className="my-2">
                <Fieldset.Legend>city name</Fieldset.Legend>
                <Controller
                  control={control}
                  name="mail-address-city"
                  rules={{ required: showMailAddress, pattern: /^[A-Za-z -']+$/ }}
                  render={({ onChange, onBlur, value, name }, { invalid }) => (
                    <Field.Root invalid={invalid}>
                      <Input
                        type="text"
                        className="form-input my-2"
                        name={name}
                        placeholder="apt or unit #"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                      <Field.Error className="error-message" match={invalid}>
                        missing/invalid city name
                      </Field.Error>
                    </Field.Root>
                  )}
                />
              </Fieldset.Root>
              <Fieldset.Root>
                <Fieldset.Legend>state</Fieldset.Legend>
                <Controller
                  control={control}
                  name="mail-address-state"
                  rules={{ required: showMailAddress }}
                  render={({ onChange, onBlur, value, name }, { invalid }) => (
                    <Field.Root>
                      <Select.Root
                        items={addressStates}
                        name={name}
                        value={value}
                        onValueChange={onChange}
                      >
                        <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Positioner className="form-select">
                            <Select.ScrollUpArrow className="" />
                            <Select.Popup>
                              {addressStates.map(({ label, value }) => (
                                <Select.Item key={label} value={value} className="">
                                  <Select.ItemIndicator className="">
                                    <CheckIcon />
                                  </Select.ItemIndicator>
                                  <Select.ItemText className="">{label}</Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Popup>
                          </Select.Positioner>
                        </Select.Portal>
                      </Select.Root>
                      <Field.Error className="error-message" match={invalid}>
                        missing state address
                      </Field.Error>
                    </Field.Root>
                  )}
                />
              </Fieldset.Root>
            </div>
            <Fieldset.Root className="my-2">
              <Fieldset.Legend>zip</Fieldset.Legend>
              <Controller
                control={control}
                name="mail-address-zip"
                rules={{ required: showMailAddress, pattern: /^\d{5}$/ }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root invalid={invalid}>
                    <Input
                      type="number"
                      className="form-input my-2"
                      name={name}
                      placeholder="zipcode"
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <Field.Error className="error-message" match={invalid}>
                      missing/invalid zip
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          Work in SF */}

        <Controller
          control={control}
          name="work-in-sf"
          rules={{ required: true }}
          render={({ onChange, onBlur, value, name }, { invalid }) => (
            <Field.Root className="my-2" name={name} render={<Fieldset.Root />}>
              <Fieldset.Legend>do you work in san francisco?</Fieldset.Legend>
              <RadioGroup
                value={value}
                onValueChange={onChange}
                onBlur={onBlur}
                className="flex-col"
              >
                <div>
                  <Field.Label>
                    <Radio.Root value="yes" className="form-radio">
                      <Radio.Indicator className="form-radio" />
                    </Radio.Root>
                    yes
                  </Field.Label>
                </div>
                <div>
                  <Field.Label>
                    <Radio.Root value="no" className="form-radio">
                      <Radio.Indicator className="form-radio" />
                    </Radio.Root>
                    no
                  </Field.Label>
                </div>
              </RadioGroup>
              <Field.Error className="error-message" match={invalid}>
                Please select one of the options above.
              </Field.Error>
            </Field.Root>
          )}
        />

        <button className="mt-8 button" type="submit">
          next
        </button>
      </Form>
    </div>
  )
}

export default B2Contact
