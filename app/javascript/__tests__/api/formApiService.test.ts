import { post } from "../../api/apiService"
import { submitForm } from "../../api/formApiService"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

describe("formApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(post as jest.Mock).mockResolvedValue({ data: { id: "test-id" } })
  })
  it("submits the application form", async () => {
    const formData = {
      primaryApplicantFirstName: "First name",
      primaryApplicantMiddleName: "Middle name",
      primaryApplicantLastName: "Last name",
      primaryApplicantDob: "1990-01-01",
    }
    await submitForm(formData, "testListingId")

    const today = new Date().toISOString().split("T")[0]
    expect(post).toHaveBeenCalledWith("/api/v1/short-form/application", {
      application: {
        listingID: "testListingId",
        applicationLanguage: undefined,
        status: "Submitted",
        primaryApplicant: {
          firstName: "First name",
          middleName: "Middle name",
          lastName: "Last name",
          dob: "1990-01-01",
        },
        householdMembers: [],
        annualIncome: 0,
        applicationSubmittedDate: today,
      },
      autosave: false,
      initialSave: true,
      locale: "en",
      uploaded_file: { file: "todo.png" },
    })
  })
})
