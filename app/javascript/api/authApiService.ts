import { AxiosResponse } from "axios"
import { User, UserData } from "../authentication/user"
import { authenticatedGet, post, put } from "./apiService"
import { AuthHeaders, setAuthHeaders } from "../authentication/token"

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
