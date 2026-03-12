import React from "react"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import ListingApplyLiveWorkPreference from "../../../../pages/form/components/ListingApplyLiveWorkPreference"
import { FormEngineProvider } from "../../../../formEngine/formEngineContext"
import { openRentalListing } from "../../../data/RailsRentalListing/listing-rental-open"
import { PREFERENCES } from "../../../../modules/constants"
import type { RailsListingPreference } from "../../../../api/types/rails/listings/RailsListingPreferences"
import { deleteUploadedProofFile } from "../../../../api/formApiService"

jest.mock("../../../../api/formApiService", () => ({
  uploadProofFile: jest.fn(),
  deleteUploadedProofFile: jest.fn(),
}))

const mockDeleteUploadedProofFile = deleteUploadedProofFile as jest.Mock

jest.mock("../../../../pages/form/components/PreferenceProofUploadField", () => {
  return () => <div data-testid="proof-upload-field">PreferenceProofUploadField</div>
})

const fieldNames = {
  liveOrWorkInSf: "liveOrWorkInSf",
  liveOrWorkInSfClaimedOption: "liveOrWorkInSfClaimedOption",
  liveInSf: "liveInSf",
  workInSf: "workInSf",
  liveInSfMember: "liveInSfMember",
  liveInSfProofType: "liveInSfProofType",
  liveInSfProofDoc: "liveInSfProofDoc",
  liveInSfFileName: "liveInSfFileName",
  liveInSfFileUploadedAt: "liveInSfFileUploadedAt",
  workInSfMember: "workInSfMember",
  workInSfProofType: "workInSfProofType",
  workInSfProofDoc: "workInSfProofDoc",
  workInSfFileName: "workInSfFileName",
  workInSfFileUploadedAt: "workInSfFileUploadedAt",
  optOutLiveWork: "optOutLiveWork",
}

const allFieldNameValues = Object.values(fieldNames)

const mockHandleNextStep = jest.fn()
const mockHandlePrevStep = jest.fn()
const mockSaveFormData = jest.fn()

const renderComponent = (formData: Record<string, unknown> = {}) => {
  const formEngineContextValue = {
    listing: openRentalListing,
    preferences: [
      {
        preferenceName: PREFERENCES.liveWorkInSf,
        listingPreferenceID: "test-pref-id",
      } as RailsListingPreference,
    ],
    sessionId: "test-session-id",
    formData,
    saveFormData: mockSaveFormData,
    dataSources: {
      listing: openRentalListing,
      form: {},
      preferenceNames: {},
    },
    stepInfoMap: [{ slug: "live-work", fieldNames: allFieldNameValues }],
    sectionNames: [],
    currentStepIndex: 0,
    handleNextStep: mockHandleNextStep,
    handlePrevStep: mockHandlePrevStep,
  }

  render(
    <FormEngineProvider value={formEngineContextValue}>
      <ListingApplyLiveWorkPreference fieldNames={fieldNames} />
    </FormEngineProvider>
  )
}

describe("ListingApplyLiveWorkPreference", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteUploadedProofFile.mockResolvedValue({ success: true })
  })

  it("renders the nav buttons, title, instructions, and opt-out checkbox", () => {
    renderComponent()
    expect(screen.getByText(t("t.back"))).toBeInTheDocument()
    expect(screen.getByText(t("t.next"))).toBeInTheDocument()
    expect(screen.getByText(t("e2cLiveWorkPreference.title"))).toBeInTheDocument()
    expect(screen.getByText(t("e2cLiveWorkPreference.instructions"))).toBeInTheDocument()
    expect(screen.getByText(t("label.dontWantPreference"))).toBeInTheDocument()
  })

  it("renders the live/work checkbox", () => {
    renderComponent()
    expect(
      screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title"))
    ).toBeInTheDocument()
  })

  it("calls handlePrevStep when back button is clicked", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.back")))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })

  it("shows combo fields when live/work checkbox is checked", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    expect(screen.getByText(t("label.preferenceOptionToClaim"))).toBeInTheDocument()
  })

  it("hides combo fields when live/work checkbox is unchecked", () => {
    renderComponent()
    expect(screen.queryByText(t("label.preferenceOptionToClaim"))).not.toBeInTheDocument()
  })

  it("shows live preference fields when liveInSf is selected from combo dropdown", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    const comboSelect = screen.getByLabelText(t("label.preferenceOptionToClaim"))
    await user.selectOptions(comboSelect, "liveInSf")
    expect(screen.getByText(t("label.applicantPreferencesDocumentName"))).toBeInTheDocument()
  })

  it("shows work preference fields when workInSf is selected from combo dropdown", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    const comboSelect = screen.getByLabelText(t("label.preferenceOptionToClaim"))
    await user.selectOptions(comboSelect, "workInSf")
    expect(screen.getByText(t("label.applicantPreferencesDocumentName"))).toBeInTheDocument()
  })

  it("shows error when submitting without any checkbox selected", async () => {
    renderComponent()
    const user = userEvent.setup()
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()
  })

  it("does not show required checkbox error when submitting with live/work checkbox selected", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    const comboSelect = screen.getByLabelText(t("label.preferenceOptionToClaim"))
    await user.selectOptions(comboSelect, "liveInSf")
    const memberSelect = screen.getByLabelText(t("label.applicantPreferencesDocumentName"))
    await user.selectOptions(memberSelect, "test")
    await user.click(screen.getByText(t("t.next")))
    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).not.toBeInTheDocument()
  })

  it("calls saveFormData and handleNextStep on valid submit with live/work checked", async () => {
    renderComponent({ liveInSfFileName: "test-file.pdf" })
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    const comboSelect = screen.getByLabelText(t("label.preferenceOptionToClaim"))
    await user.selectOptions(comboSelect, "liveInSf")
    const memberSelect = screen.getByLabelText(t("label.applicantPreferencesDocumentName"))
    await user.selectOptions(memberSelect, "test")
    await user.click(screen.getByText(t("t.next")))
    expect(mockSaveFormData).toHaveBeenCalled()
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("calls saveFormData and handleNextStep on valid submit with opt-out checked", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("label.dontWantPreference")))
    await user.click(screen.getByText(t("t.next")))
    expect(mockSaveFormData).toHaveBeenCalled()
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("unchecks live/work checkbox when opt-out is checked", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    expect(screen.getByText(t("label.preferenceOptionToClaim"))).toBeInTheDocument()

    await user.click(screen.getByText(t("label.dontWantPreference")))
    expect(screen.queryByText(t("label.preferenceOptionToClaim"))).not.toBeInTheDocument()
  })

  it("unchecks opt-out when live/work checkbox is checked", async () => {
    renderComponent()
    const user = userEvent.setup()

    const optOut = screen.getByLabelText(t("label.dontWantPreference"))
    await user.click(optOut)
    expect(optOut).toBeChecked()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    expect(optOut).not.toBeChecked()
  })

  it("clears required checkbox error when a checkbox is selected after failed submit", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).not.toBeInTheDocument()
  })

  it("clears required checkbox error when opt-out is selected after failed submit", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()

    await user.click(screen.getByText(t("label.dontWantPreference")))
    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).not.toBeInTheDocument()
  })

  it("closes the required checkbox error message when close button is clicked", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseSelectPreferenceOption"))).toBeInTheDocument()
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.close")))
    expect(screen.queryByText(t("error.pleaseSelectPreferenceOption"))).not.toBeInTheDocument()
    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).not.toBeInTheDocument()
  })

  it("closes the incomplete document error message when close button is clicked", async () => {
    renderComponent()
    const user = userEvent.setup()

    await user.click(screen.getByText(t("e2cLiveWorkPreference.liveWorkSfPreference.title")))
    const comboSelect = screen.getByLabelText(t("label.preferenceOptionToClaim"))
    await user.selectOptions(comboSelect, "liveInSf")
    await user.click(screen.getByText(t("t.next")))
    expect(screen.getByText(t("error.pleaseCompletePreference"))).toBeInTheDocument()

    await user.click(screen.getByLabelText(t("t.close")))
    expect(screen.queryByText(t("error.pleaseCompletePreference"))).not.toBeInTheDocument()
  })

  it("populates default values from formData", () => {
    renderComponent({ liveOrWorkInSf: true })
    expect(screen.getByText(t("label.preferenceOptionToClaim"))).toBeInTheDocument()
  })
})
