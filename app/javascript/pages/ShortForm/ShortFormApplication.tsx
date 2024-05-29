import React, { useEffect, useState } from "react"
import { RailsShortFormApplication } from "./ShortFormApplicationHelpers"
import * as _ from "lodash"
import { getDraftApplication, postUpdateApplication } from "../../api/applicationApiService"
import { Button, Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"

const ShortFormApplication = ({ listingId }: { listingId: string }) => {
  const [application, setApplication] = useState({} as RailsShortFormApplication)
  // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-explicit-any
  const { handleSubmit, errors, trigger, register } = useForm<Record<string, any>>({
    shouldFocusError: false,
    mode: "onChange",
  })

  const submitApplication = async () => {
    const validation = await trigger()
    if (!validation) return

    void postUpdateApplication(application?.id, application)
  }

  useEffect(() => {
    void getDraftApplication(listingId).then((draftApplication) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setApplication(draftApplication)
    })
  }, [listingId])

  useEffect(() => {
    register({ name: "primaryApplicant.lastName" }, { required: true })
  })

  const handleFormChange = (event) => {
    // Clone form because we need to modify it
    let updatedApplication = { ...application }

    if (event.nativeEvent) {
      _.set(updatedApplication, event.nativeEvent.target.name, event.nativeEvent.target.value)
    } else if (event.target) {
      // Get the name of the field that caused this change event
      // Get the new value of this field
      // Assign new value to the appropriate form field
      _.set(updatedApplication, event.target.name, event.target.value)
    } else {
      updatedApplication = {
        ...updatedApplication,
        ...event,
        primaryApplicant: { ...updatedApplication.primaryApplicant, ...event.primaryApplicant },
      }
    }

    console.log("Application changed:", updatedApplication)

    // Update state
    setApplication(updatedApplication)
  }

  return (
    <div className="contact-form">
      <Form onSubmit={handleSubmit(handleFormChange)}>
        <h1>Contact</h1>
        <Field
          onChange={handleFormChange}
          name="primaryApplicant.firstName"
          label="First Name"
          defaultValue={application?.primaryApplicant?.firstName}
          validation={{ required: true, maxLength: 64 }}
          error={errors.primaryApplicant?.firstName}
          errorMessage={
            errors.primaryApplicant?.firstName?.type === "maxLength"
              ? "Max length error"
              : "Name error"
          }
          register={register}
        />
        {/* <ApplicationInput
          label="First Name"
          name="primaryApplicant.firstName"
          value={application?.primaryApplicant?.firstName || ""}
          onChange={handleFormChange}
        /> */}
        <div>{errors.primaryApplicant?.lastName ? "Has error" : "No error"}</div>
        <div>
          <label>
            Last Name
            <input
              ref={register({ required: true })}
              type="text"
              name="primaryApplicant.lastName"
              value={application?.primaryApplicant?.lastName || ""}
              onChange={handleFormChange}
            />
          </label>
        </div>
        {/* <ApplicationInput
          label="Last Name"
          name="primaryApplicant.lastName"
          value={application?.primaryApplicant?.lastName || ""}
          onChange={handleFormChange}
        /> */}
        <Button onClick={submitApplication}>Submit</Button>
        {/* <DOBField
          onChange={handleFormChange}
          strings={{ month: "Month", day: "Day", year: "Year" }}
          register={register}
          required={true}
          error={errors.applicant}
          name="primaryApplicant"
          id="primaryApplicant.dateOfBirth"
          watch={watch}
          validateAge18={true}
          errorMessage="Error in date of birth"
          label="Your date of birth"
        /> */}
      </Form>
    </div>
  )
}

export default ShortFormApplication
