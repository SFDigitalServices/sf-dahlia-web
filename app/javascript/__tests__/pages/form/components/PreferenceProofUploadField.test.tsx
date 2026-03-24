import React from "react"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import PreferenceProofUploadField from "../../../../pages/form/components/PreferenceProofUploadField"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import { uploadProofFile, deleteUploadedProofFile } from "../../../../api/formApiService"

jest.mock("../../../../api/formApiService", () => ({
  uploadProofFile: jest.fn(),
  deleteUploadedProofFile: jest.fn(),
}))

const mockUploadProofFile = uploadProofFile as jest.Mock
const mockDeleteUploadedProofFile = deleteUploadedProofFile as jest.Mock

const props = {
  sessionId: "test-session-id",
  listingId: "test-listing-id",
  listingPreferenceId: "test-listing-preference-id",
  proofTypeFieldName: "proofType",
  proofTypeLabel: "Document Type",
  proofTypeNote: "Select a document type",
  proofTypeOptions: [
    { label: "label.proof.telephoneBill", value: "Telephone bill" },
    { label: "label.proof.gasBill", value: "Gas bill" },
  ],
  proofFileName: "proofFile",
  proofFileUploadedAt: "proofFileDate",
}

const renderComponent = (formData: Record<string, unknown> = {}) => {
  renderWithFormContextWrapper(<PreferenceProofUploadField {...props} />, { formData: formData })
}

describe("PreferenceProofUploadField", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders select dropdown, button, and instructions", () => {
    renderComponent()
    expect(screen.getByText("Document Type")).not.toBeNull()
    expect(screen.getByText(t("label.selectOne"))).not.toBeNull()
    expect(screen.getByText(t("label.uploadProofOfPreference"))).not.toBeNull()
    expect(screen.getByText(t("label.uploadProofInstructions1"))).not.toBeNull()
    expect(screen.getByText(t("label.uploadProofInstructions3"))).not.toBeNull()
  })

  it("disables the upload button when no document type is selected", () => {
    renderComponent()
    const uploadButton = screen.getByText(t("label.uploadProofOfPreference"))
    expect(uploadButton).toBeDisabled()
  })

  it("enables the upload button after selecting a document type", async () => {
    renderComponent()
    const user = userEvent.setup()

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const uploadButton = screen.getByText(t("label.uploadProofOfPreference"))
    expect(uploadButton).not.toBeDisabled()
  })

  it("shows validation error when form is submitted without selecting a proof type", async () => {
    renderComponent()
    const user = userEvent.setup()

    const submitButton = screen.getByText("next")
    await user.click(submitButton)
    expect(screen.getByText(t("error.pleaseSelectAnOption"))).not.toBeNull()
  })

  it("uploads a file successfully", async () => {
    mockUploadProofFile.mockResolvedValue({
      success: true,
      name: "test-file.pdf",
      created_at: "2026-01-15T00:00:00Z",
    })
    renderComponent()
    const user = userEvent.setup()

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(mockUploadProofFile).toHaveBeenCalledWith(
        "test-session-id",
        "test-listing-id",
        "test-listing-preference-id",
        "Telephone bill",
        expect.any(File)
      )
    })

    await waitFor(() => {
      expect(screen.getByText("test-file.pdf")).not.toBeNull()
    })
  })

  it("shows an error message when upload fails", async () => {
    jest.spyOn(console, "error").mockImplementation()
    mockUploadProofFile.mockRejectedValue(new Error("Network error"))
    renderComponent()
    const user = userEvent.setup()

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
      expect(screen.getByText(t("error.fileUploadFailed"))).not.toBeNull()
    })
  })

  it("shows an error when upload response indicates failure", async () => {
    jest.spyOn(console, "error").mockImplementation()
    mockUploadProofFile.mockResolvedValue({ success: false })
    renderComponent()
    const user = userEvent.setup()

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
      expect(screen.getByText(t("error.fileUploadFailed"))).not.toBeNull()
    })
  })

  it("deletes an uploaded file", async () => {
    mockUploadProofFile.mockResolvedValue({
      success: true,
      name: "test-file.pdf",
      created_at: "2026-01-15T00:00:00Z",
    })
    mockDeleteUploadedProofFile.mockResolvedValue({ success: true })
    renderComponent()
    const user = userEvent.setup()

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(screen.getByText("test-file.pdf")).not.toBeNull()
    })

    const deleteButton = screen.getByText(t("t.delete"))
    await user.click(deleteButton)
    await waitFor(() => {
      expect(mockDeleteUploadedProofFile).toHaveBeenCalledWith(
        "test-session-id",
        "test-listing-id",
        "test-listing-preference-id",
        "Telephone bill"
      )
    })
  })

  it("shows an error when a file with an invalid type is selected", async () => {
    jest.spyOn(console, "error").mockImplementation()
    renderComponent()
    const user = userEvent.setup({ applyAccept: false })

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.txt", { type: "text/plain" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(screen.getByText(t("error.fileUpload"))).not.toBeNull()
    })
    expect(console.error).toHaveBeenCalled()
    expect(mockUploadProofFile).not.toHaveBeenCalled()
  })

  it("shows an error when a file exceeds the max size", async () => {
    jest.spyOn(console, "error").mockImplementation()
    renderComponent()
    const user = userEvent.setup({ applyAccept: false })

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const largeContent = new ArrayBuffer(6_000_001)
    const file = new File([largeContent], "large-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(screen.getByText(t("error.fileUpload"))).not.toBeNull()
    })
    expect(console.error).toHaveBeenCalled()
    expect(mockUploadProofFile).not.toHaveBeenCalled()
  })

  it("shows an error when the file name is longer than 80 characters", async () => {
    renderComponent()
    const user = userEvent.setup({ applyAccept: false })

    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const longName = "a".repeat(77) + ".pdf"
    const file = new File(["test content"], longName, { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(screen.getByText(t("error.fileNameTooLong"))).not.toBeNull()
    })
    expect(mockUploadProofFile).not.toHaveBeenCalled()
  })

  it("shows an error when file deletion fails", async () => {
    jest.spyOn(console, "error").mockImplementation()
    mockUploadProofFile.mockResolvedValue({
      success: true,
      name: "test-file.pdf",
      created_at: "2026-01-15T00:00:00Z",
    })
    mockDeleteUploadedProofFile.mockRejectedValue(new Error("Delete failed"))
    renderComponent()

    const user = userEvent.setup()
    const select = screen.getByLabelText("Document Type")
    await user.selectOptions(select, "Telephone bill")
    const file = new File(["test content"], "test-file.pdf", { type: "application/pdf" })
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput as HTMLInputElement, file)
    await waitFor(() => {
      expect(screen.getByText("test-file.pdf")).not.toBeNull()
    })

    const deleteButton = screen.getByText(t("t.delete"))
    await user.click(deleteButton)
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
      expect(screen.getByText(t("error.fileUploadFailed"))).not.toBeNull()
    })
  })
})
