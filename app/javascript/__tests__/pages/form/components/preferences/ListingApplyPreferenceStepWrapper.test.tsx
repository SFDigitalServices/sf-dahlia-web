import React from "react"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import ListingApplyPreferenceStepWrapper from "../../../../../pages/form/components/preferences/ListingApplyPreferenceStepWrapper"
import { type PreferenceContent } from "../../../../../pages/form/components/preferences/PreferenceUtils"
import { PREFERENCES } from "../../../../../modules/constants"
import type { RailsListingPreference } from "../../../../../api/types/rails/listings/RailsListingPreferences"
import { deleteUploadedProofFile } from "../../../../../api/formApiService"
import { renderWithFormContextWrapper } from "../../../../__util__/renderUtils"

jest.mock("../../../../../api/formApiService", () => ({
  uploadProofFile: jest.fn(),
  deleteUploadedProofFile: jest.fn(),
}))

const mockDeleteUploadedProofFile = deleteUploadedProofFile as jest.Mock

Object.defineProperty(window, "scrollTo", {
  value: jest.fn(),
  writable: true,
})
Element.prototype.scrollTo = jest.fn()

const certOfPreferenceContent: PreferenceContent = {
  preferenceName: "certificateOfPreference",
  checkboxLabel: "e7PreferencesPrograms.certOfPreference",
  checkboxDescription: "e7PreferencesPrograms.certOfPreferenceDesc",
  certificateNumberLabel: "label.certificateNumber",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const displacedTenantPreferenceContent: PreferenceContent = {
  preferenceName: "displacedTenant",
  checkboxLabel: "e7PreferencesPrograms.displaced",
  checkboxDescription: "e7PreferencesPrograms.displacedCertificate",
  certificateNumberLabel: "label.certificateNumber",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const assistedHousingPreferenceContent: PreferenceContent = {
  preferenceName: "assistedHousing",
  checkboxLabel: "e3aAssistedHousingPreference.preference.title",
  checkboxDescription: "e3aAssistedHousingPreference.preference.description",
  proofTypeLabel: "label.uploadCopyOfLease",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const veteranPreferenceContent: PreferenceContent = {
  preferenceName: "veteran",
  checkboxLabel: "label.veteransInHousehold",
  checkboxDescription: "label.applicantPreferencesDocumentName",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const liveInSfPreferenceContent: PreferenceContent = {
  preferenceName: "liveInSf",
  checkboxLabel: "e2cLiveWorkPreference.liveWorkSfPreference.liveSfPreference",
  checkboxDescription: "e2cLiveWorkPreference.liveSfPreference.description",
  proofTypeLabel: "label.preferenceProofAddressDocuments",
  proofTypeNote: "e2cLiveWorkPreference.documentMustShowCorrectName",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const workInSfPreferenceContent: PreferenceContent = {
  preferenceName: "workInSf",
  checkboxLabel: "e2cLiveWorkPreference.liveWorkSfPreference.workSfPreference",
  checkboxDescription: "e2cLiveWorkPreference.workSfPreference.description",
  proofTypeLabel: "label.preferenceProofDocuments",
  proofTypeNote: "e2cLiveWorkPreference.documentMustShowCorrectNameForWork",
  proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
  proofUploadButtonLabel: "label.uploadProofOfPreference",
}

const renderWrapper = ({
  preferenceContents = [certOfPreferenceContent],
  optOut,
  subPreferenceClaimed,
  comboPreference,
  includeOptOut = true,
  formData = {
    primaryApplicantFirstName: "Alice",
    primaryApplicantMiddleName: "M",
    primaryApplicantLastName: "Walker",
  },
  preferences,
  title = "e2cLiveWorkPreference.title",
  description = "e2cLiveWorkPreference.instructions",
  greenHeader,
}: {
  preferenceContents?: PreferenceContent[]
  optOut?: string
  subPreferenceClaimed?: string
  comboPreference?: {
    checkboxLabel: string
    checkboxDescription: string
    preferenceName: string
    subPreferenceSelectLabel: string
    subPreferenceClaimedFieldName: string
  }
  includeOptOut?: boolean
  formData?: Record<string, unknown>
  preferences?: RailsListingPreference[]
  title?: string
  description?: string
  greenHeader?: boolean
} = {}) => {
  const optOutFieldName = includeOptOut ? (optOut ?? "_certOptOut") : undefined
  const defaultPreferences: RailsListingPreference[] = comboPreference
    ? ([
        {
          preferenceName: PREFERENCES[comboPreference.preferenceName],
          listingPreferenceID: "pref-combo",
          readMoreUrl: "https://example.test/read-more",
        },
      ] as unknown as RailsListingPreference[])
    : (preferenceContents.map((content, idx) => ({
        preferenceName: PREFERENCES[content.preferenceName],
        listingPreferenceID: `pref-${idx}`,
        readMoreUrl: "https://example.test/read-more",
      })) as unknown as RailsListingPreference[])

  return renderWithFormContextWrapper(
    <ListingApplyPreferenceStepWrapper
      title={title}
      description={description}
      greenHeader={greenHeader}
      fieldNames={{
        claimedPreferences: "claimedPreferences",
        optOut: optOutFieldName,
        subPreferenceClaimed,
      }}
      preferenceContents={preferenceContents}
      comboPreference={comboPreference}
    />,
    {
      formData,
      renderForm: false,
      stepInfoMap: [
        {
          slug: "preferences",
          fieldNames: [
            "claimedPreferences",
            ...(optOutFieldName ? [optOutFieldName] : []),
            ...(subPreferenceClaimed ? [subPreferenceClaimed] : []),
          ],
        },
      ],
      staticData: {
        preferences: preferences || defaultPreferences,
      },
    }
  )
}

describe("ListingApplyPreferenceStepWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteUploadedProofFile.mockResolvedValue({ success: true })
    // react-hook-form warns when formState.isValid is read in onSubmit mode;
    // this component intentionally uses both, so silence the noise.
    jest.spyOn(console, "warn").mockImplementation()
  })

  it("renders the page title, instructions, and back/next buttons", () => {
    renderWrapper()
    expect(screen.getByText(t("e2cLiveWorkPreference.title"))).toBeInTheDocument()
    expect(screen.getByText(t("e2cLiveWorkPreference.instructions"))).toBeInTheDocument()
    expect(screen.getByText(t("t.back"))).toBeInTheDocument()
    expect(screen.getByText(t("t.next"))).toBeInTheDocument()
  })

  it("renders the standard preference checkbox label and description", () => {
    renderWrapper()
    expect(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))).toBeInTheDocument()
    expect(screen.getByText(t("label.pleaseSelectPreference"))).toBeInTheDocument()
  })

  it("renders the opt-out checkbox when optOut field name is provided", () => {
    renderWrapper()
    expect(screen.getByLabelText(t("label.dontWantPreference"))).toBeInTheDocument()
    expect(screen.getByText(t("label.stillHaveOpportunityToClaim"))).toBeInTheDocument()
  })

  it("calls handlePrevStep when the back button is clicked", async () => {
    const { mockHandlePrevStep } = renderWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.back")))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })

  it("shows the required-checkbox error when submitting with no selections and an opt-out", async () => {
    renderWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectPreferenceOption"))).toBeInTheDocument()
    expect(screen.getByText(t("error.pleaseSelectPreferenceContent"))).toBeInTheDocument()
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()
  })

  it("does not require a selection when there is no opt-out checkbox", async () => {
    const { mockSaveFormData, mockHandleNextStep } = renderWrapper({ includeOptOut: false })
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.queryByText(t("error.pleaseSelectPreferenceOption"))).not.toBeInTheDocument()
    expect(mockSaveFormData).toHaveBeenCalled()
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("clears the required-checkbox error when the preference checkbox is selected", async () => {
    renderWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectPreferenceOption"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))
    expect(screen.queryByText(t("error.pleaseSelectPreferenceOption"))).not.toBeInTheDocument()
  })

  it("clears the required-checkbox error when the opt-out checkbox is selected", async () => {
    renderWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectPreferenceOption"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("label.dontWantPreference")))
    expect(screen.queryByText(t("error.pleaseSelectPreferenceOption"))).not.toBeInTheDocument()
  })

  it("dismisses the required-checkbox error when the close button is clicked", async () => {
    renderWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectPreferenceOption"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.close")))
    expect(screen.queryByText(t("error.pleaseSelectPreferenceOption"))).not.toBeInTheDocument()
  })

  it("dismisses the incomplete-document error when the close button is clicked", async () => {
    renderWrapper({
      preferenceContents: [assistedHousingPreferenceContent],
    })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("e3aAssistedHousingPreference.preference.title")))
    await user.selectOptions(
      screen.getByLabelText(t("label.applicantPreferencesDocumentName")),
      "primaryApplicant"
    )
    await user.click(screen.getByText(t("t.next")))
    expect(await screen.findByText(t("error.pleaseCompletePreference"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.close")))
    await waitFor(() => {
      expect(screen.queryByText(t("error.pleaseCompletePreference"))).not.toBeInTheDocument()
    })
  })

  it("unchecks any claimed preference when opt-out is selected", async () => {
    renderWrapper()
    const user = userEvent.setup()

    const prefCheckbox = screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))
    await user.click(prefCheckbox)
    expect(prefCheckbox).toBeChecked()

    await user.click(screen.getByLabelText(t("label.dontWantPreference")))
    expect(prefCheckbox).not.toBeChecked()
  })

  it("unchecks opt-out when a preference checkbox is selected", async () => {
    renderWrapper()
    const user = userEvent.setup()

    const optOutCheckbox = screen.getByLabelText(t("label.dontWantPreference"))
    await user.click(optOutCheckbox)
    expect(optOutCheckbox).toBeChecked()

    await user.click(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference")))
    expect(optOutCheckbox).not.toBeChecked()
  })

  it("submits successfully with the opt-out checked", async () => {
    const { mockSaveFormData, mockHandleNextStep } = renderWrapper()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("label.dontWantPreference")))
    await user.click(screen.getByText(t("t.next")))

    expect(mockSaveFormData).toHaveBeenCalledWith(
      expect.objectContaining({
        _certOptOut: true,
        claimedPreferences: expect.any(Object),
      })
    )
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("populates the opt-out default value from formData", () => {
    renderWrapper({ formData: { _certOptOut: true } })
    expect(screen.getByLabelText(t("label.dontWantPreference"))).toBeChecked()
  })

  it("renders without crashing when greenHeader is true", () => {
    renderWrapper({ greenHeader: true })
    expect(screen.getByText(t("e2cLiveWorkPreference.title"))).toBeInTheDocument()
  })

  it("throws when a preference content has an unknown preference name", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()
    expect(() =>
      renderWrapper({
        preferenceContents: [
          {
            preferenceName: "notARealPreference",
            checkboxLabel: "e7PreferencesPrograms.certOfPreference",
            checkboxDescription: "e7PreferencesPrograms.certOfPreferenceDesc",
            proofHouseholdMemberLabel: "label.applicantPreferencesDocumentName",
            proofUploadButtonLabel: "label.uploadProofOfPreference",
          },
        ],
      })
    ).toThrow("notARealPreference is not a valid preference name.")
    consoleErrorSpy.mockRestore()
  })

  it("throws when listing preferences are missing the requested preference", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()
    expect(() =>
      renderWrapper({
        preferenceContents: [veteranPreferenceContent],
        preferences: [
          {
            preferenceName: PREFERENCES.certificateOfPreference,
            listingPreferenceID: "pref-other",
          } as unknown as RailsListingPreference,
        ],
      })
    ).toThrow(`${PREFERENCES.veteran} is missing for this listing.`)
    consoleErrorSpy.mockRestore()
  })

  it("shows the incomplete document error message when a claimed preference has a household member but no uploaded proof file", async () => {
    renderWrapper({
      preferenceContents: [assistedHousingPreferenceContent],
    })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("e3aAssistedHousingPreference.preference.title")))
    await user.selectOptions(
      screen.getByLabelText(t("label.applicantPreferencesDocumentName")),
      "primaryApplicant"
    )
    await user.click(screen.getByText(t("t.next")))

    expect(await screen.findByText(t("error.pleaseCompletePreference"))).toBeInTheDocument()
    expect(await screen.findByText(t("error.pleaseCompletePreferenceContent"))).toBeInTheDocument()
  })

  it("renders multiple preference checkboxes", () => {
    renderWrapper({
      preferenceContents: [certOfPreferenceContent, displacedTenantPreferenceContent],
    })
    expect(screen.getByLabelText(t("e7PreferencesPrograms.certOfPreference"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("e7PreferencesPrograms.displaced"))).toBeInTheDocument()
  })

  it("keeps the combo select value visible after choosing a sub-preference", async () => {
    renderWrapper({
      preferenceContents: [liveInSfPreferenceContent, workInSfPreferenceContent],
      subPreferenceClaimed: "_liveOrWorkInSfClaimedPreference",
      comboPreference: {
        checkboxLabel: "e2cLiveWorkPreference.liveWorkSfPreference.title",
        checkboxDescription: "e2cLiveWorkPreference.liveWorkSfPreference.description",
        preferenceName: "liveWorkInSf",
        subPreferenceSelectLabel: "label.preferenceOptionToClaim",
        subPreferenceClaimedFieldName: "_liveOrWorkInSfClaimedPreference",
      },
    })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    await user.selectOptions(screen.getByLabelText(t("label.preferenceOptionToClaim")), "workInSf")

    expect(
      screen.getByDisplayValue(t("e2cLiveWorkPreference.liveWorkSfPreference.workSfPreference"))
    ).toBeInTheDocument()
    expect(screen.getByLabelText(t("label.applicantPreferencesDocumentName"))).toBeInTheDocument()
  })
})
