import axios, { AxiosInstance } from "axios"

import { setHeaders, getHeaders, AuthHeaders } from "../authentication/token"
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

export const signIn = async (email: string, password: string): Promise<User> => {
  const res = await axios.post<UserData>("/api/v1/auth/sign_in", {
    email,
    password,
  })
  setHeaders(loadHeaders(res.headers))

  return res.data.data
}

// Use this function for authenticated calls
export const createAxiosInstance = (): AxiosInstance => {
  if (!getHeaders()) {
    throw new Error("Unauthorized. Sign in first")
  }

  return axios.create({
    headers: getHeaders(),
    transformResponse: (res, headers) => {
      setHeaders(loadHeaders(headers))
      return res
    },
  })
}

export const getProfile = async (): Promise<User> => {
  const res = await createAxiosInstance().get<UserData>("/api/v1/auth/validate_token")

  return res.data.data
}

export const forgotPassword = async (email: string): Promise<string> => {
  const res = await axios.put<{ message: string }>("/user/forgot-password", {
    appUrl: window.location.origin,
    email: email,
  })
  return res.data.message
}

export const updatePassword = async (
  token: string,
  password: string,
  passwordConfirmation: string
): Promise<string> => {
  const res = await axios.put<{ accessToken: string }>("/user/update-password", {
    password: password,
    passwordConfirmation: passwordConfirmation,
    token: token,
  })
  return res.data.accessToken
}
