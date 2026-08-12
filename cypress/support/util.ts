import { type IToggle } from "unleash-proxy-client"

const staticUserData = {
  provider: "email",
  id: 123,
  email: "test@test.com",
  uid: "test@test.com",
  created_at: "2024-08-19T10:40:19.671-07:00",
  updated_at: "2024-09-11T12:12:57.160-07:00",
  salesforce_contact_id: "000000000000000000",
  temp_session_id: null,
  allow_password_change: false,
  zip: null,
  yCoordinate: null,
  xCoordinate: null,
  workInSf: null,
  whiteOther: null,
  whichComponentOfLocatorWasUsed: null,
  webAppID: "123",
  state: null,
  sexualOrientationOther: null,
  sexualOrientation: null,
  sexAtBirth: null,
  relationship: null,
  raceEthnicity: null,
  race: null,
  primaryLanguage: null,
  preferenceAddressMatch: null,
  phoneType: null,
  phone: null,
  pacificIslanderOther: null,
  otherLanguage: null,
  noPhone: null,
  noEmail: null,
  noAddress: null,
  MLSId: null,
  middleName: null,
  menaOther: null,
  MCCCertified: false,
  mailingZip: null,
  mailingState: null,
  mailingCity: null,
  mailingAddress: null,
  lendingAgentStatus: null,
  latinoOther: null,
  lastName: "Doe",
  jobClassification: null,
  isVeteran: null,
  isSFUSDEmployee: null,
  indigenousOther: null,
  indigenousNativeAmericanGroup: null,
  indigenousCentralSouthAmericaGroup: null,
  hiv: null,
  hasSameAddressAsApplicant: null,
  hasDisability: null,
  hasAltMailingAddress: null,
  genderOther: null,
  gender: null,
  firstName: "John",
  ethnicity: null,
  DOB: "1991-01-01",
  DALPCertified: false,
  contactId: "000000000000000000",
  city: null,
  candidateScore: null,
  BMRCertified: false,
  blackOther: null,
  asianOther: null,
  appMemberType: "Primary Applicant",
  appMemberId: null,
  alternatePhoneType: null,
  alternatePhone: null,
  alternateContactTypeOther: null,
  alternateContactType: null,
  agency: null,
  address: null,
  accountId: "000000000000000000",
  acceptingNewMOHCDClients: false,
}

export const generateHeaders = (email: string) => ({
  expiry: `${Date.now() / 1000 + 6000}`,
  "access-token": "mock-access-token",
  client: "mock-client",
  uid: email,
  "token-type": "Bearer",
})

export const userObjectGenerator = ({
  email,
  firstName,
  lastName,
  DOB,
}: {
  email?: string
  firstName?: string
  lastName?: string
  DOB?: string
}) => {
  return {
    statusCode: 200,
    body: {
      data: {
        email: email || staticUserData.email,
        uid: email || staticUserData.email,
        firstName: firstName || staticUserData.firstName,
        lastName: lastName || staticUserData.lastName,
        DOB: DOB || staticUserData.DOB,
        ...staticUserData,
      },
    },
    headers: generateHeaders(email || staticUserData.email),
  }
}

export const interceptUnleashFlags = () => {
  const toggleOffNames = new Set(["temp.all.housingCounselorAccess", "temp.webapp.auth.clerk"])
  const toggleOnNames = new Set(["temp.webapp.newAccountLayout"])
  cy.intercept(
    "GET",
    "https://dahlia-feature-service-fbc319c3f542.herokuapp.com/api/frontend**",
    (request) => {
      request.continue((response) => {
        const interceptedToggles: IToggle[] = []
        const existingToggleNames = new Set(
          response.body.toggles.map((toggle: IToggle) => toggle.name) as string[]
        )
        // exclude "off" toggles from the payload
        response.body.toggles.forEach((toggle: IToggle) => {
          if (!toggleOffNames.has(toggle.name))
            interceptedToggles.push({
              ...toggle,
              enabled: toggleOnNames.has(toggle.name) || toggle.enabled,
            })
        })
        // add "on" toggles to the payload if they're not already there
        toggleOnNames.forEach((toggleName: string) => {
          if (!existingToggleNames.has(toggleName))
            interceptedToggles.push({ name: toggleName, enabled: true } as IToggle)
        })
        response.body.toggles = interceptedToggles
      })
    }
  ).as("unleashFlags")
}
