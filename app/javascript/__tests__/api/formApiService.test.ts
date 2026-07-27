import { post, apiDelete } from "../../api/apiService"
import {
  submitForm,
  uploadProofFile,
  deleteUploadedProofFile,
  locateVerifiedAddress,
  checkHouseholdEligibility,
  checkNeighborhoodPreferenceMatch,
} from "../../api/formApiService"

jest.mock("axios")

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
  apiDelete: jest.fn(),
}))
const staticData = ({
  preferenceNames = {},
  Project_ID = "2017-040",
}: { preferenceNames?: Record<string, string>; Project_ID?: string } = {}) =>
  ({
    listing: { Id: "listing-1", Building_Name: "Shirley Chisholm Village", Project_ID },
    preferenceNames,
  }) as never

const verifiedAddressResponse = {
  // Uses Shirley Chisholm as the test listing/address for boundary match
  address: {
    street1: "1360 43rd Ave",
    street2: "",
    city: "San Francisco",
    state: "CA",
    zip: "94122",
  },
}
const applicantInfo = {
  firstName: "John",
  middleName: "M",
  lastName: "Smith",
  dob: "1990-01-12",
}

describe("formApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(post as jest.Mock).mockResolvedValue({ data: { id: "test-id" } })
    ;(apiDelete as jest.Mock).mockResolvedValue({ data: { success: true } })
  })

  describe("uploadProofFile", () => {
    it("posts form data to the proof endpoint", async () => {
      const mockResponse = { success: true, name: "file.pdf", created_at: "2026-01-01" }
      ;(post as jest.Mock).mockResolvedValue({ data: mockResponse })

      const file = new File(["content"], "file.pdf", { type: "application/pdf" })
      const result = await uploadProofFile("session-1", "listing-1", "pref-1", "Gas bill", file)

      expect(post).toHaveBeenCalledWith("/api/v1/short-form/proof", expect.any(FormData), {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const formData: FormData = (post as jest.Mock).mock.calls[0][1]
      expect(formData.get("uploaded_file[session_uid]")).toBe("session-1")
      expect(formData.get("uploaded_file[listing_id]")).toBe("listing-1")
      expect(formData.get("uploaded_file[listing_preference_id]")).toBe("pref-1")
      expect(formData.get("uploaded_file[document_type]")).toBe("Gas bill")
      expect(formData.get("uploaded_file[file]")).toBeInstanceOf(File)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("deleteUploadedProofFile", () => {
    it("sends a delete request with the correct payload", async () => {
      const result = await deleteUploadedProofFile("session-1", "listing-1", "pref-1", "Gas bill")

      expect(apiDelete).toHaveBeenCalledWith("/api/v1/short-form/proof", {
        data: {
          uploaded_file: {
            session_uid: "session-1",
            listing_id: "listing-1",
            listing_preference_id: "pref-1",
            document_type: "Gas bill",
          },
        },
      })
      expect(result).toEqual({ success: true })
    })
  })

  describe("submitForm", () => {
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

  describe("locateVerifiedAddress", () => {
    it("sends the address fields to validate with the correct payload", async () => {
      const result = await locateVerifiedAddress({
        street1: "123 Main St",
        street2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
      })

      expect(post).toHaveBeenCalledWith("/api/v1/addresses/validate.json", {
        address: {
          street1: "123 Main St",
          street2: "Apt 4B",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
        },
      })
      expect(result).toEqual({ id: "test-id" })
    })
  })

  describe("checkHouseholdEligibility", () => {
    it("sends the household eligibility check with the correct payload", async () => {
      const result = await checkHouseholdEligibility("testListingId", 3, "50000", 1)

      expect(post).toHaveBeenCalledWith("/api/v1/short-form/validate-household", {
        eligibility: {
          householdsize: 3,
          incomelevel: "50000",
          childrenUnder6: 1,
        },
        listing_id: "testListingId",
      })
      expect(result).toEqual({ id: "test-id" })
    })
  })
  describe("checkNeighborhoodPreferenceMatch", () => {
    beforeEach(() => {
      ;(post as jest.Mock).mockResolvedValue({ data: { gis_data: { boundary_match: true } } })
    })

    it("returns boundary match data", async () => {
      const result = await checkNeighborhoodPreferenceMatch(
        verifiedAddressResponse,
        staticData({ preferenceNames: { neighborhoodResidence: "NRHP" } }),
        applicantInfo
      )

      expect(result).toBe(true)
      expect(post).toHaveBeenCalledWith("/api/v1/addresses/gis-data.json", {
        address: { address1: "1360 43rd Ave", city: "San Francisco", state: "CA", zip: "94122" },
        listing: { Id: "listing-1", Name: "Shirley Chisholm Village" },
        project_id: "2017-040",
        member: applicantInfo,
      })
    })

    it("returns false when outside the boundary", async () => {
      ;(post as jest.Mock).mockResolvedValue({ data: { gis_data: { boundary_match: false } } })
      const result = await checkNeighborhoodPreferenceMatch(
        verifiedAddressResponse,
        staticData({ preferenceNames: { neighborhoodResidence: "NRHP" } }),
        applicantInfo
      )
      expect(result).toBe(false)
    })

    it("returns null when the backend returns a null match", async () => {
      ;(post as jest.Mock).mockResolvedValue({ data: { gis_data: { boundary_match: null } } })
      const result = await checkNeighborhoodPreferenceMatch(
        verifiedAddressResponse,
        staticData({ preferenceNames: { neighborhoodResidence: "NRHP" } }),
        applicantInfo
      )
      expect(result).toBeNull()
    })

    it("uses 'ADHP' as project_id when antiDisplacement is present", async () => {
      await checkNeighborhoodPreferenceMatch(
        verifiedAddressResponse,
        staticData({ preferenceNames: { antiDisplacement: "ADHP" } }),
        applicantInfo
      )
      expect(post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ project_id: "ADHP" })
      )
    })

    it("uses the listing Project_ID for neighborhoodResidence", async () => {
      await checkNeighborhoodPreferenceMatch(
        verifiedAddressResponse,
        staticData({
          preferenceNames: { neighborhoodResidence: "NRHP" },
          Project_ID: "9999-000",
        }),
        applicantInfo
      )
      expect(post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ project_id: "9999-000" })
      )
    })
  })
})
