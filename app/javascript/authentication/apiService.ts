import axios, { AxiosInstance } from "axios"

import { setHeaders, getHeaders, AuthHeaders } from "./token"
import { User, UserData } from "./user"

const loadHeaders = (header: Record<string, string>): AuthHeaders => {
  const { expiry, client, uid } = header
  return {
    expiry,
    client,
    uid,
    "access-token": header["access-token"],
    "token-type": header["token-type"],
  }
}

export const signIn = async (email: string, password: string): Promise<User> =>
  axios
    .post<UserData>("/api/v1/auth/sign_in", {
      email,
      password,
    })
    .then(({ data, headers }) => {
      setHeaders(loadHeaders(headers))
      return data.data
    })

// Use this function for authenticated calls
export const createAxiosInstance = (): AxiosInstance => {
  if (!getHeaders()) {
    throw new Error("Unauthorized. Sign in first")
  }

  return axios.create({
    headers: getHeaders(),
    transformResponse: (res, headers) => {
      if (headers["access-token"]) {
        setHeaders(loadHeaders(headers))
      }
      return JSON.parse(res)
    },
  })
}

export const getProfile = async (): Promise<User> =>
  createAxiosInstance()
    .get<UserData>("/api/v1/auth/validate_token")
    .then((res) => res.data.data)

export const forgotPassword = async (email: string): Promise<string> =>
  axios
    .put<{ message: string }>("/user/forgot-password", {
      appUrl: window.location.origin,
      email: email,
    })
    .then(({ data }) => data.message)

export const updatePassword = async (
  token: string,
  password: string,
  passwordConfirmation: string
): Promise<string> =>
  axios
    .put<{ accessToken: string }>("/user/update-password", {
      password: password,
      passwordConfirmation: passwordConfirmation,
      token: token,
    })
    .then(({ data }) => data.accessToken)
