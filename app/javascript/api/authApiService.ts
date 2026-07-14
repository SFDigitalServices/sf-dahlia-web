import { AxiosResponse } from "axios"
import { Contact, User, UserData } from "../authentication/user"
import { authenticatedDelete, authenticatedGet, authenticatedPut, post } from "./apiService"
import { AuthHeaders, setAuthHeaders } from "../authentication/token"
import { Application } from "./types/rails/application/RailsApplication"
import { getCurrentLanguage, getRoutePrefix, LanguagePrefix } from "../util/languageUtil"
import { getResetPasswordPath } from "../util/routeUtil"
import { housingCounselorAgencies } from "./apiEndpoints"

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
  housingCounselingAgencyName: user.housingCounselingAgencyName,
  housingCounselingAgencyLastModified: user.housingCounselingAgencyLastModified,
  housingCounselingAgencyId: user.housingCounselingAgencyId,
})

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

export const getProfile = async (): Promise<User> =>
  authenticatedGet<UserData>("/api/v1/auth/validate_token").then((res) => res.data.data)

export const getApplications = async (): Promise<{ applications: Application[] }> =>
  authenticatedGet<{ applications: Application[] }>("/api/v1/account/my-applications").then(
    (res) => res.data
  )

export const deleteApplication = async (id: string) =>
  authenticatedDelete(`/api/v1/short-form/application/${id}`).then((res) => {
    return res.data
  })

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

export const updateHousingCounselorAccess = async (user: User): Promise<User> =>
  authenticatedPut<{ contact: User }>("/api/v1/account/update", {
    contact: contactObject(user),
  }).then(({ data }) => data.contact)

export type HousingCounselorAgency = {
  Id: string
  Name: string
}

export const getHousingCounselorAgencies = async (): Promise<HousingCounselorAgency[]> =>
  authenticatedGet<{ agencies: HousingCounselorAgency[] }>(housingCounselorAgencies()).then(
    ({ data }) => data.agencies
  )

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
