import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import PreferenceCheckbox from "../../../../pages/form/components/PreferenceCheckbox"
import {
  type PreferenceContent,
  type PreferenceFieldNames,
} from "../../../../pages/form/components/ListingApplyPreferenceStepWrapper"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

jest.mock("../../../../pages/form/components/PreferenceProofUploadField", () => {
  const MockProofUploadField = (props: { proofTypeLabel: string }) => (
    <div data-testid="proof-upload-field">{props.proofTypeLabel}</div>
  )
  return {
    __esModule: true,
    default: MockProofUploadField,
  }
})

const fieldNames: PreferenceFieldNames = {
  preferenceClaimed: "claimedPreferences.testPref.preferenceClaimed",
  householdMemberId: "claimedPreferences.testPref.householdMemberId",
  certificateNumber: "claimedPreferences.testPref.certificateNumber",
  proofType: "claimedPreferences.testPref.proofType",
  proofFileName: "claimedPreferences.testPref.proofFileName",
  proofFileUploadedAt: "claimedPreferences.testPref.proofFileUploadedAt",
}

const baseContent: PreferenceContent = {
  preferenceName: "testPref",
  checkboxLabel: "e7PreferencesPrograms.certOfPreference",
  checkboxDescription: "e7PreferencesPrograms.certOfPreferenceDesc",
}

const defaultFormData = {
  primaryApplicantFirstName: "Alice",
  primaryApplicantMiddleName: "M",
  primaryApplicantLastName: "Walker",
  primaryApplicantBirthYear: "1990",
  primaryApplicantBirthMonth: "1",
  primaryApplicantBirthDate: "15",
}

const renderPreferenceCheckbox = ({
  preferenceContent = baseContent,
  showRequiredCheckboxError = false,
  listingPreferenceId = "test-listing-preference-id",
  readMoreUrl,
  onPreferenceCheckboxChange = jest.fn(),
  formData = defaultFormData,
}: {
  preferenceContent?: PreferenceContent
  showRequiredCheckboxError?: boolean
  listingPreferenceId?: string
  readMoreUrl?: string
  onPreferenceCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  formData?: Record<string, unknown>
} = {}) => {
  return renderWithFormContextWrapper(
    <PreferenceCheckbox
      showRequiredCheckboxError={showRequiredCheckboxError}
      onPreferenceCheckboxChange={onPreferenceCheckboxChange}
      preferenceContent={preferenceContent}
      preferenceFieldNames={fieldNames}
      listingPreferenceId={listingPreferenceId}
      readMoreUrl={readMoreUrl}
    />,
    { formData }
  )
}

describe("PreferenceCheckbox", () => {
  it("renders the checkbox label and description", () => {
    renderPreferenceCheckbox()
    expect(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))).toBeInTheDocument()
    expect(
      screen.getByText(/Certificate of Preference \(COP\) from the former/)
    ).toBeInTheDocument()
  })

  it("renders the read-more link when readMoreUrl is provided", () => {
    renderPreferenceCheckbox({ readMoreUrl: "https://example.test/preferences" })
    const link = screen.getByText(t("label.findOutMoreAboutPreferences"))
    expect(link).toBeInTheDocument()
    expect(link.closest("a")).toHaveAttribute("href", "https://example.test/preferences")
  })

  it("renders the household member select with default label when checked", async () => {
    renderPreferenceCheckbox()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))

    const memberSelect = screen.getByLabelText(t("label.applicantPreferencesDocumentName"))
    expect(memberSelect).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Alice M Walker" })).toBeInTheDocument()
  })

  it("uses proofHouseholdMemberLabel for the household member select when provided", async () => {
    renderPreferenceCheckbox({
      preferenceContent: {
        ...baseContent,
        proofHouseholdMemberLabel: "label.preferenceOptionToClaim",
      },
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))

    expect(screen.getByLabelText(t("label.preferenceOptionToClaim"))).toBeInTheDocument()
    expect(
      screen.queryByLabelText(t("label.applicantPreferencesDocumentName"))
    ).not.toBeInTheDocument()
  })

  it("calls onPreferenceCheckboxChange when the checkbox is toggled", async () => {
    const onChange = jest.fn()
    renderPreferenceCheckbox({ onPreferenceCheckboxChange: onChange })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))
    expect(onChange).toHaveBeenCalled()
  })

  it("shows the required checkbox error styling when showRequiredCheckboxError is true", () => {
    renderPreferenceCheckbox({ showRequiredCheckboxError: true })
    const checkbox = screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))
    expect(checkbox).toHaveAttribute("aria-invalid", "true")
  })

  it("renders the proof upload field when checked and all proof props are provided", async () => {
    renderPreferenceCheckbox({
      preferenceContent: {
        ...baseContent,
        proofTypeLabel: "label.proof.telephoneBill",
        proofTypeNote: "label.proof.cableBill",
      },
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))

    expect(screen.getByTestId("proof-upload-field")).toBeInTheDocument()
    expect(screen.getByTestId("proof-upload-field")).toHaveTextContent(
      t("label.proof.telephoneBill")
    )
  })

  it("renders the certificate number field when checked and certificate props are provided", async () => {
    renderPreferenceCheckbox({
      preferenceContent: {
        ...baseContent,
        certificateNumberLabel: "label.certificateNumber",
        certificateNumberNote: "label.proof.cableBill",
      },
    })
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))

    expect(screen.getByLabelText(t("label.certificateNumber"))).toBeInTheDocument()
    expect(screen.getByPlaceholderText(t("label.certificateNumber"))).toBeInTheDocument()
  })

  it("hides preference content fields when the checkbox is unchecked again", async () => {
    renderPreferenceCheckbox({
      preferenceContent: {
        ...baseContent,
        proofTypeLabel: "label.proof.telephoneBill",
        certificateNumberLabel: "label.certificateNumber",
      },
    })
    const user = userEvent.setup()
    const checkbox = screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))

    await user.click(checkbox)
    expect(screen.getByTestId("proof-upload-field")).toBeInTheDocument()

    await user.click(checkbox)
    expect(screen.queryByTestId("proof-upload-field")).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(t("label.applicantPreferencesDocumentName"))
    ).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(t("label.certificateNumber"))).not.toBeInTheDocument()
  })
})
