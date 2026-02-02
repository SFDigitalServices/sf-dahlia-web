import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import CertificateNumberPreference from "../../../../pages/form/components/CertificateNumberPreference"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderCertificateNumberPreference = () => {
  const fieldNames = {
    copMember: "copMember",
    copNumber: "copNumber",
  }

  const formData = {
    primaryApplicantFirstName: "Bob",
    primaryApplicantLastName: "Jones",
    householdMemberFirstName: "Chad",
    householdMemberLastName: "Smith",
  }
  renderWithFormContextWrapper(
    <CertificateNumberPreference
      name="e7PreferencesPrograms.certOfPreference"
      description="e7PreferencesPrograms.certOfPreferenceDesc"
      numberName="e7PreferencesPrograms.certOfPreferenceCertificate"
      numberDescription="e7PreferencesPrograms.needCertificateForPreference"
      readMoreUrl="https://www.sf.gov/learn-about-certificate-preference-cop"
      fieldNames={fieldNames}
    />,
    formData
  )
}

describe("CertificateNumberPreference", () => {
  it("renders checkbox labels and description", () => {
    renderCertificateNumberPreference()
    expect(screen.getByText(t("e7PreferencesPrograms.certOfPreference"))).not.toBeNull()
    expect(screen.getByText(t("label.findOutMoreAboutPreferences"))).not.toBeNull()
  })

  it("displays select and certificate fields when checkbox is checked", async () => {
    renderCertificateNumberPreference()
    const user = userEvent.setup()

    const checkbox = screen.getByText(t("e7PreferencesPrograms.certOfPreference"))
    await user.click(checkbox)

    expect(screen.getByText(t("label.applicantPreferencesHouseholdMember"))).not.toBeNull()
    expect(screen.getByPlaceholderText(t("label.certificateNumber"))).not.toBeNull()
  })

  it("displays error when preference is checked but no household member is chosen", async () => {
    renderCertificateNumberPreference()
    const user = userEvent.setup()

    const checkbox = screen.getByText(t("e7PreferencesPrograms.certOfPreference"))
    await user.click(checkbox)

    const submitButton = screen.getByText("next")
    await user.click(submitButton)

    expect(screen.getByText(t("error.pleaseSelectAnOption"))).not.toBeNull()
  })
})
