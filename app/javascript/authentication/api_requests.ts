import axios, { AxiosInstance } from "axios"

import { AuthHeaders } from "./token"
import { User, UserData } from "./user"

const getHeaders = (res) => {
  const { expiry, client, uid } = res.headers
  const headers = {
    expiry,
    client,
    uid,
    "access-token": res.headers["access-token"],
    "token-type": res.headers["token-type"],
  }
  return headers
}

export const validateToken = async (axiosClient: AxiosInstance) => {
  const res = await axiosClient.get<User>("/api/v1/auth/validate_token")

  return getHeaders(res)
}

export const login = async (apiBase: string, email: string, password: string) => {
  const res = await axios.post<{ accessToken: string }>(`${apiBase}/auth/login`, {
    email: email,
    password,
  })
  const { accessToken } = res.data
  return accessToken
}

export const signIn = async (apiBase: string, email: string, password: string) => {
  const res = await axios.post<{ accessToken: string }>(`${apiBase}/api/v1/auth/sign_in`, {
    email: email,
    password,
  })

  return getHeaders(res)
}

export const getProfile = async (client: AxiosInstance) => {
  const res = await client.get<UserData>("/api/v1/auth/validate_token")
  return { profile: res.data.data, headers: getHeaders(res) }
}

export const createAxiosInstance = (apiUrl: string, headers: AuthHeaders) =>
  axios.create({
    baseURL: apiUrl,
    headers: headers,
  })

export const forgotPassword = async (apiUrl: string, email: string) => {
  const res = await axios.put<{ message: string }>(`${apiUrl}/user/forgot-password`, {
    appUrl: window.location.origin,
    email: email,
  })
  const { message } = res.data
  return message
}

export const updatePassword = async (
  apiUrl: string,
  token: string,
  password: string,
  passwordConfirmation: string
) => {
  const res = await axios.put<{ accessToken: string }>(`${apiUrl}/user/update-password`, {
    password: password,
    passwordConfirmation: passwordConfirmation,
    token: token,
  })
  const { accessToken } = res.data
  return accessToken
}
