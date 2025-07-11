import React, { useState, useEffect } from "react"

import { Form } from "@base-ui-components/react/form"
import { Field } from "@base-ui-components/react/field"
import { Fieldset } from "@base-ui-components/react/fieldset"
import { Input } from "@base-ui-components/react/input"
import { Select } from "@base-ui-components/react/select"
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
  "claim-preference": boolean
  "no-preference": boolean
  "choose-preference": boolean
  "preference-option"?: string
  "live-in-sf-claimant"?: string
  "live-in-sf-doctype"?: string
  "live-in-sf-proof"?: string
  "work-in-sf-claimant"?: string
  "work-in-sf-doctype"?: string
  "work-in-sf-proof"?: string
}

const CheckIcon = () => (
  <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10">
    <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
  </svg>
)

const E2cLiveWorkPreference = ({ applicationData, nextPage, prevPage, saveData }: Props) => {
  const [blockedAlert, setBlockedAlert] = useState(false)

  const [claimPref, setClaimPref] = useState(false)
  const [noPref, setNoPref] = useState(false)

  const {
    control,
    errors,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    getValues,
    setValue,
  } = useForm<Inputs>({
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      "claim-preference": !!applicationData["preference-option"] || false,
      "no-preference": false,
      "choose-preference": false,
      "preference-option": applicationData["preference-option"] || "",
      "live-in-sf-claimant": applicationData["live-in-sf-claimant"] || "",
      "live-in-sf-doctype": applicationData["live-in-sf-doctype"] || "",
      "live-in-sf-proof": applicationData["live-in-sf-proof"] || "",
      "work-in-sf-claimant": applicationData["work-in-sf-claimant"] || "",
      "work-in-sf-doctype": applicationData["work-in-sf-doctype"] || "",
      "work-in-sf-proof": applicationData["work-in-sf-proof"] || "",
    },
  })

  const preferenceOptions = [
    { label: "Select one", value: "" },
    { label: "Live in san francisco", value: "live-in-sf" },
    { label: "Work in san francisco", value: "work-in-sf" },
  ]

  const preferenceClaimant = [
    { label: "Select one", value: "" },
    {
      label: `${applicationData["first-name"]} ${applicationData["last-name"]}`,
      value: "telephone bill",
    },
    { label: "household member 1", value: "hh-member-1" },
    { label: "household member 2", value: "hh-member-2" },
  ]

  const liveInSfDoc = [
    { label: "Select one", value: "" },
    { label: "telephone bill", value: "telephone-bill" },
    { label: "cable and internet bill", value: "cable-and-internet-bill" },
    { label: "gas bill", value: "gas-bill" },
  ]

  const workInSfDoc = [
    { label: "Select one", value: "" },
    { label: "paystub with employer address", value: "paystub" },
    { label: "letter-from-employer", value: "letter-from-employer" },
  ]

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
  const workInSfProof = watch("work-in-sf-proof")
  const workInSfDoctype = watch("work-in-sf-doctype")
  const liveInSfProof = watch("live-in-sf-proof")
  const liveInSfDoctype = watch("live-in-sf-doctype")

  useEffect(() => console.log(getValues()))

  return (
    <div className="flex-col justify-items-center m-8">
      <button className="button" type="button" onClick={prevPage}>
        back
      </button>
      <h2>
        Based on the addresses you entered, your household may qualify for the following lottery
        preferences.
      </h2>
      {blockedAlert && (
        <p onClick={() => setBlockedAlert(false)} className="error-message">
          You'll need to resolve any errors before moving on
        </p>
      )}
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        {/****************************************************************************************************************************************************************************************
          claim preference */}

        <Field.Root name="claimPref" className="my-2">
          <Field.Label>
            <Checkbox.Root
              className="form-checkbox"
              checked={claimPref}
              onCheckedChange={handleChangeClaimPref}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            live or work in san francisco preference
          </Field.Label>
        </Field.Root>

        {/****************************************************************************************************************************************************************************************
          preference option */}

        {claimPref && (
          <Fieldset.Root>
            <Fieldset.Legend>which preference option would you like to claim?</Fieldset.Legend>
            <Controller
              control={control}
              name="preference-option"
              rules={{ required: claimPref }}
              render={({ onChange, onBlur, value, name }, { invalid }) => (
                <Field.Root>
                  <Select.Root
                    items={preferenceOptions}
                    name={name}
                    value={value}
                    onValueChange={onChange}
                  >
                    <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner className="form-select" sideOffset={8}>
                        <Select.ScrollUpArrow className="" />
                        <Select.Popup>
                          {preferenceOptions.map(({ label, value }) => (
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
                    missing preference option
                  </Field.Error>
                </Field.Root>
              )}
            />
          </Fieldset.Root>
        )}

        {/****************************************************************************************************************************************************************************************
          live in sf */}

        {preferenceOption === "live-in-sf" && (
          <>
            <Fieldset.Root>
              <Fieldset.Legend>whose name is on the document you're uploading?</Fieldset.Legend>
              <Controller
                control={control}
                name="live-in-sf-claimant"
                rules={{ required: claimPref }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root>
                    <Select.Root
                      items={preferenceClaimant}
                      name={name}
                      value={value}
                      onValueChange={onChange}
                    >
                      <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="form-select" sideOffset={8}>
                          <Select.ScrollUpArrow className="" />
                          <Select.Popup>
                            {preferenceClaimant.map(({ label, value }) => (
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
                      missing live in sf preference claimant
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
            <Fieldset.Root>
              <Fieldset.Legend>
                What type of document would you like to upload to show you live at that address?
              </Fieldset.Legend>
              <Controller
                control={control}
                name="live-in-sf-doctype"
                rules={{ required: claimPref }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root>
                    <Select.Root
                      items={liveInSfDoc}
                      name={name}
                      value={value}
                      onValueChange={onChange}
                    >
                      <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="form-select" sideOffset={8}>
                          <Select.ScrollUpArrow className="" />
                          <Select.Popup>
                            {liveInSfDoc.map(({ label, value }) => (
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
                      missing live in sf preference claimant
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
            <Fieldset.Root>
              <Controller
                control={control}
                name="live-in-sf-proof"
                rules={{ required: true }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root invalid={invalid}>
                    <Field.Label htmlFor="live-in-sf-proof" className="button">
                      upload proof of preference
                    </Field.Label>
                    <Input
                      id="live-in-sf-proof"
                      type="file"
                      className="invisible"
                      name={name}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      disabled={liveInSfDoctype.length === 0}
                    />
                    {liveInSfProof && <p>{liveInSfProof}</p>}
                    <Field.Error className="error-message" match={invalid}>
                      missing proof of preference
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          work in sf */}

        {preferenceOption === "work-in-sf" && (
          <>
            <Fieldset.Root>
              <Fieldset.Legend>whose name is on the document you're uploading?</Fieldset.Legend>
              <Controller
                control={control}
                name="work-in-sf-claimant"
                rules={{ required: claimPref }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root>
                    <Select.Root
                      items={preferenceClaimant}
                      name={name}
                      value={value}
                      onValueChange={onChange}
                    >
                      <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="form-select" sideOffset={8}>
                          <Select.ScrollUpArrow className="" />
                          <Select.Popup>
                            {preferenceClaimant.map(({ label, value }) => (
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
                      missing live in sf preference claimant
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
            <Fieldset.Root>
              <Fieldset.Legend>
                Which document are you uploading to prove eligibility?
              </Fieldset.Legend>
              <Controller
                control={control}
                name="work-in-sf-doctype"
                rules={{ required: claimPref }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root>
                    <Select.Root
                      items={workInSfDoc}
                      name={name}
                      value={value}
                      onValueChange={onChange}
                    >
                      <Select.Trigger className="my-2 form-select" onBlur={onBlur}>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner className="form-select" sideOffset={8}>
                          <Select.ScrollUpArrow className="" />
                          <Select.Popup>
                            {workInSfDoc.map(({ label, value }) => (
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
                      missing live in sf preference claimant
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
            <Fieldset.Root>
              <Controller
                control={control}
                name="work-in-sf-proof"
                rules={{ required: true }}
                render={({ onChange, onBlur, value, name }, { invalid }) => (
                  <Field.Root invalid={invalid}>
                    <Field.Label className="button" htmlFor="work-in-sf-proof">
                      upload proof of preference
                    </Field.Label>
                    <Input
                      id="work-in-sf-proof"
                      type="file"
                      className="invisible"
                      name={name}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      disabled={workInSfDoctype.length === 0}
                    />
                    {workInSfProof && <p>{workInSfProof}</p>}
                    <Field.Error className="error-message" match={invalid}>
                      missing proof of preference
                    </Field.Error>
                  </Field.Root>
                )}
              />
            </Fieldset.Root>
          </>
        )}

        {/****************************************************************************************************************************************************************************************
          no preference */}

        <Field.Root name="noPref" className="my-2">
          <Field.Label>
            <Checkbox.Root
              className="form-checkbox"
              checked={noPref}
              onCheckedChange={handleChangeNoPref}
            >
              <Checkbox.Indicator>
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>
            I don't want this lottery preference
          </Field.Label>
        </Field.Root>
        {!!errors["choose-preference"] && (
          <p className="error-message">Please select one of the options above.</p>
        )}

        <button className="mt-8 button" type="submit">
          next
        </button>
      </Form>
    </div>
  )
}

export default E2cLiveWorkPreference
