import { AxiosResponse } from "axios"
import { User, UserData } from "../authentication/user"
import { authenticatedDelete, authenticatedGet, authenticatedPut, post, put } from "./apiService"
import { AuthHeaders, setAuthHeaders } from "../authentication/token"
import { Application } from "./types/rails/application/RailsApplication"

export const signIn = async (email: string, password: string): Promise<User> =>
  post<UserData>("/api/v1/auth/sign_in", {
    email,
    password,
  }).then(({ data, headers }: AxiosResponse<UserData>) => {
    setAuthHeaders(headers as AuthHeaders)
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
  put<{ message: string }>("/user/forgot-password", {
    appUrl: window.location.origin,
    email: email,
  }).then(({ data }) => data.message)

export const updatePassword = async (
  token: string,
  password: string,
  passwordConfirmation: string
): Promise<string> =>
  put<{ accessToken: string }>("/user/update-password", {
    password: password,
    passwordConfirmation: passwordConfirmation,
    token: token,
  }).then(({ data }) => data.accessToken)

export const updateNameOrDOB = async (user: User): Promise<User> => {
  return authenticatedPut<{ contact: User }>("/api/v1/account/update", {
    contact: {
      email: user.email,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      DOB: user.DOB,
    },
  }).then(({ data }) => data.contact)
}

export const updateEmail = async (email: string): Promise<string> =>
  authenticatedPut<{ status: string }>("/api/v1/auth", {
    user: {
      email,
    },
  }).then(({ data }) => data.status)
