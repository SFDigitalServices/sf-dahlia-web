import React, { useEffect, useState } from "react"
import { RailsShortFormApplication } from "./ShortFormApplicationHelpers"
import { getDraftApplication } from "../../api/applicationApiService"
import { Button, DOBField, Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"

const reformatApplicationForFrontend = (
  application: RailsShortFormApplication
): RailsShortFormApplication => {
  const dob = application?.primaryApplicant?.DOB
  if (dob) {
    const parts = dob.split("-")
    const birth = { birthYear: parts[0], birthMonth: parts[1], birthDay: parts[2] }
    application.primaryApplicant.dateOfBirth = birth
  }

  return application
}

const reformatApplicationForBackend = (
  application: RailsShortFormApplication
): RailsShortFormApplication => {
  const dateOfBirth = application?.primaryApplicant?.dateOfBirth
  if (dateOfBirth) {
    application.primaryApplicant.DOB = [
      dateOfBirth.birthYear,
      dateOfBirth.birthMonth,
      dateOfBirth.birthDay,
    ].join("-")
  }

  return application
}

const ShortFormApplication = ({ listingId }: { listingId: string }) => {
  const [application, setApplication] = useState({} as RailsShortFormApplication)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, errors, trigger, register, watch } = useForm<RailsShortFormApplication>({
    shouldFocusError: false,
    mode: "onChange",
  })

  if (Object.keys(errors).length > 0) {
    console.log(errors)
  }

  const submitApplication = (newApplicationData) => {
    const updatedApplication: RailsShortFormApplication = {
      ...application,
      ...newApplicationData,
      primaryApplicant: { ...application.primaryApplicant, ...newApplicationData.primaryApplicant },
    }

    trigger()
      .then((validation) => {
        if (validation) {
          // transform to ruby
          const submission = reformatApplicationForBackend(updatedApplication)
          console.log("submission", submission)
          // return postUpdateApplication(application?.id, submission)
        }
      })
      .catch(() => {
        console.log("Not valid")
      })
  }

  useEffect(() => {
    void getDraftApplication(listingId).then((draftApplication) => {
      // transform to javascript
      const frontendApplication = reformatApplicationForFrontend(draftApplication)
      setApplication(frontendApplication)
    })
  }, [listingId])

  // useEffect(() => {
  //   register({ name: "primaryApplicant.lastName" }, { required: true })
  // })

  // const handleFormChange = (event) => {
  //   console.log(event)
  //   // Clone form because we need to modify it
  //   let updatedApplication = { ...application }

  //   if (event.nativeEvent) {
  //     _.set(updatedApplication, event.nativeEvent.target.name, event.nativeEvent.target.value)
  //   } else if (event.target) {
  //     // Get the name of the field that caused this change event
  //     // Get the new value of this field
  //     // Assign new value to the appropriate form field
  //     _.set(updatedApplication, event.target.name, event.target.value)
  //   } else {
  //     updatedApplication = {
  //       ...updatedApplication,
  //       ...event,
  //       primaryApplicant: { ...updatedApplication.primaryApplicant, ...event.primaryApplicant },
  //     }
  //   }

  //   console.log("Application changed:", updatedApplication)

  //   // Update state
  //   setApplication(updatedApplication)
  // }

  return (
    <div className="contact-form">
      <Form onSubmit={handleSubmit(submitApplication)}>
        <h1>Contact</h1>
        <Field
          name="primaryApplicant.firstName"
          label="First Name"
          defaultValue={application?.primaryApplicant?.firstName}
          validation={{ required: true, maxLength: 64 }}
          error={!!errors.primaryApplicant?.firstName}
          errorMessage={
            errors.primaryApplicant?.firstName?.type === "maxLength"
              ? "Max length error"
              : "Name error"
          }
          register={register}
        />
        <Field
          name="primaryApplicant.lastName"
          label="Last Name"
          defaultValue={application?.primaryApplicant?.lastName}
          validation={{ required: true, maxLength: 64 }}
          error={!!errors.primaryApplicant?.lastName}
          errorMessage={
            errors.primaryApplicant?.lastName?.type === "maxLength"
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
        {/* <div>{errors.primaryApplicant?.lastName ? "Has error" : "No error"}</div>
        <div>
          <label>
            Last Name
            <input
              ref={register({ required: true })}
              type="text"
              name="primaryApplicant.lastName"
              value={application?.primaryApplicant?.lastName || ""}
            />
          </label>
        </div> */}
        <DOBField
          defaultDOB={application?.primaryApplicant?.dateOfBirth}
          name="primaryApplicant.dateOfBirth"
          strings={{ day: "Day", month: "Month", year: "Year" }}
          watch={watch}
          label={"Date of Birth"}
          register={register}
          required
          error={errors.primaryApplicant?.dateOfBirth}
          errorMessage={"DOB ERROR"}
        />
        {/* <ApplicationInput
          label="Last Name"
          name="primaryApplicant.lastName"
          value={application?.primaryApplicant?.lastName || ""}
          onChange={handleFormChange}
        /> */}
        <Button>Submit</Button>
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
