import axios from "axios"

import { setHeaders, getHeaders } from "../authentication/token"
import { UserData } from "./user"

const apiBase = process.env.BACKEND_URL

const loadHeaders = (header) => {
  const { expiry, client, uid } = header
  const headers = {
    expiry,
    client,
    uid,
    "access-token": header["access-token"],
    "token-type": header["token-type"],
  }
  return headers
}

export const signIn = async (email: string, password: string) => {
  const res = await axios.post<UserData>(`${apiBase}/api/v1/auth/sign_in`, {
    email: email,
    password,
  })
  setHeaders(loadHeaders(res.headers))

  return res.data.data
}

// Use this function for authenticated calls
export const createAxiosInstance = () => {
  if (!getHeaders()) {
    throw new Error("Unauthorized. Sign in first")
  }
  return axios.create({
    baseURL: apiBase,
    headers: getHeaders(),
    transformResponse: (res, headers) => {
      setHeaders(loadHeaders(headers))
      return res
    },
  })
}

export const getProfile = async () => {
  const res = await createAxiosInstance().get<UserData>("/api/v1/auth/validate_token")

  return res.data.data
}

export const forgotPassword = async (email: string) => {
  const res = await axios.put<{ message: string }>(`${apiBase}/user/forgot-password`, {
    appUrl: window.location.origin,
    email: email,
  })
  const { message } = res.data
  return message
}

export const updatePassword = async (
  token: string,
  password: string,
  passwordConfirmation: string
) => {
  const res = await axios.put<{ accessToken: string }>(`${apiBase}/user/update-password`, {
    password: password,
    passwordConfirmation: passwordConfirmation,
    token: token,
  })
  const { accessToken } = res.data
  return accessToken
}
