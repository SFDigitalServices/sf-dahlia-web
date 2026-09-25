import { AxiosResponse } from "axios"
import { Contact, User, UserData } from "../authentication/user"
// authenticatedGet is for Devise, Clerk authenticates its own requests
import {
  apiDelete,
  authenticatedDelete,
  authenticatedGet,
  authenticatedPut,
  get,
  post,
  put,
} from "./apiService"
import { AuthHeaders, setAuthHeaders } from "../authentication/token"
import { Application } from "./types/rails/application/RailsApplication"
import { getCurrentLanguage, getRoutePrefix, LanguagePrefix } from "../util/languageUtil"
import { getResetPasswordPath } from "../util/routeUtil"
import { housingCounselorAgencies, updateHousingCounselor } from "./apiEndpoints"

const contactObject = (user: User): Contact => ({
  email: user.email,
  firstName: user.firstName,
  middleName: user.middleName,
  lastName: user.lastName,
  DOB: user.DOB,
  phone: user.phone,
  phoneType: user.phoneType,
  alternatePhone: user.alternatePhone,
  alternatePhoneType: user.alternatePhoneType,
  housingCounselingAgencyId: user.housingCounselingAgencyId,
})

export const clerkHeaders = (sessionToken: string) => ({
  headers: { Authorization: `Bearer ${sessionToken}` },
})

// TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
// The flag picks the credential, not the presence of a token: falling back when
// a token is missing would send stale Devise headers from localStorage.
export type RequestAuth = {
  clerkEnabled: boolean
  sessionToken?: string
}

export const requireClerkHeaders = ({ sessionToken }: RequestAuth) => {
  if (!sessionToken) {
    throw new Error("Missing Clerk session token")
  }
  return clerkHeaders(sessionToken)
}

export const signIn = async (email: string, password: string): Promise<User> =>
  post<UserData>("/api/v1/auth/sign_in", {
    email,
    password,
  }).then(({ data, headers }: AxiosResponse<UserData>) => {
    setAuthHeaders(headers as AuthHeaders)
    return data.data
  })

export const confirmEmail = async (email: string): Promise<{ success: boolean }> =>
  post<{ success: boolean }>("/api/v1/auth/confirmation", { email }).then(({ data }) => data)

export const createAccount = async (
  user: {
    email: string
    password: string
    password_confirmation: string
    temp_session_id?: string
  },
  contact: {
    firstName: string
    lastName: string
    email: string
    DOB: string
  }
): Promise<User> =>
  post<UserData>("/api/v1/auth", {
    user,
    contact,
    locale: getCurrentLanguage(),
    confirm_success_url:
      process.env.NODE_ENV !== "production"
        ? "https://dahlia-full.herokuapp.com/account"
        : "https://housing.sfgov.org/account",
    config_name: "default",
  }).then(({ data }: AxiosResponse<UserData>) => {
    return data.data
  })

export const createProfile = async (
  contact: { firstName: string; middleName?: string; lastName: string; DOB: string },
  sessionToken: string
): Promise<{ contact: { contactId: string; email?: string } & Record<string, unknown> }> =>
  post<{ contact: { contactId: string; email?: string } & Record<string, unknown> }>(
    "/api/v1/account/profile",
    { contact },
    clerkHeaders(sessionToken)
  ).then(({ data }) => data)

export const getProfile = async (sessionToken?: string): Promise<User> =>
  sessionToken
    ? get<UserData>("/api/v1/account/profile", clerkHeaders(sessionToken)).then(
        ({ data }: AxiosResponse<UserData>) => data.data
      )
    : authenticatedGet<UserData>("/api/v1/auth/validate_token").then((res) => res.data.data)

export const getApplications = async (
  auth: RequestAuth
): Promise<{ applications: Application[] }> => {
  const url = "/api/v1/account/my-applications"
  return auth.clerkEnabled
    ? get<{ applications: Application[] }>(url, requireClerkHeaders(auth)).then((res) => res.data)
    : authenticatedGet<{ applications: Application[] }>(url).then((res) => res.data)
}

export const deleteApplication = async (id: string, auth: RequestAuth) => {
  const url = `/api/v1/short-form/application/${id}`
  return auth.clerkEnabled
    ? apiDelete(url, requireClerkHeaders(auth)).then((res) => res.data)
    : authenticatedDelete(url).then((res) => res.data)
}

export const forgotPassword = async (email: string): Promise<string> =>
  post<{ message: string }>("/api/v1/auth/password", {
    email,
    redirect_url: `${window.location.origin}${getResetPasswordPath()}`,
    locale: getCurrentLanguage(),
  }).then(({ data }) => data.message)

export const updateNameOrDOB = async (user: User): Promise<User> => {
  return authenticatedPut<{ contact: User }>("/api/v1/account/update", {
    contact: contactObject(user),
  }).then(({ data }) => data.contact)
}

export const updatePhone = async (user: User): Promise<User> => {
  return authenticatedPut<{ contact: User }>("/api/v1/account/update", {
    contact: contactObject(user),
  }).then(({ data }) => data.contact)
}

export const updateEmail = async (email: string): Promise<string> =>
  authenticatedPut<{ status: string }>("/api/v1/auth", {
    user: {
      email,
    },
  }).then(({ data }) => data.status)

export const updateHousingCounselorAccess = async (
  user: User,
  sessionToken: string
): Promise<User> =>
  put<{ contact: User }>(
    updateHousingCounselor(),
    { contact: contactObject(user) },
    clerkHeaders(sessionToken)
  ).then(({ data }) => data.contact)

export type HousingCounselorAgency = {
  id: string
  name: string
  shortName: string | null
}

export const getHousingCounselorAgencies = async (
  sessionToken: string
): Promise<HousingCounselorAgency[]> =>
  get<{ agencies: HousingCounselorAgency[] }>(
    housingCounselorAgencies(),
    clerkHeaders(sessionToken)
  ).then(({ data }) => data.agencies)

export const authorizeHousingCounselor = async (
  token: string,
  sessionToken: string
): Promise<void> => {
  await post("/api/v1/housing-counselor/access", { t: token }, clerkHeaders(sessionToken))
}

export const resetPassword = async (new_password: string): Promise<string> =>
  authenticatedPut<{ message: string }>("/api/v1/auth/password", {
    password: new_password,
    password_confirmation: new_password,
    locale: getRoutePrefix(window.location.pathname) || LanguagePrefix.English,
  }).then(({ data }) => data.message)

export const updatePassword = async (
  new_password: string,
  current_password: string
): Promise<string> =>
  authenticatedPut<{ message: string }>("/api/v1/auth/password", {
    password: new_password,
    password_confirmation: new_password,
    current_password,
    locale: getRoutePrefix(window.location.pathname) || LanguagePrefix.English,
  }).then(({ data }) => data.message)
