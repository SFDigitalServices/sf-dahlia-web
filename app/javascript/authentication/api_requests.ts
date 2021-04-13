import axios, { AxiosInstance } from "axios"

import { AuthHeaders, getTokenTtl } from "./token"
import { User } from "./user"

const getHeaders = (res) => {
  const { expiry, client, uid } = res.headers
  const headers = {
    expiry,
    client,
    uid,
    "access-token": res.headers["access-token"],
    "token-type": res.headers["token-type"],
  }
  console.log(res)
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
  const res = await client.get<User>("/api/v1/auth/validate_token")
  return { profile: res.data, headers: getHeaders(res) }
}

export const createAxiosInstance = (apiUrl: string, headers: AuthHeaders) =>
  axios.create({
    baseURL: apiUrl,
    headers: headers,
  })

export const scheduleTokenRefresh = (
  apiUrl: string,
  headers: AuthHeaders,
  onRefresh: (headers: AuthHeaders) => void
) => {
  const ttl = getTokenTtl()

  if (ttl < 0) {
    // If ttl is negative, then our token is already expired, we'll have to re-login to get a new token.
    // dispatch(signOut())
    return null
  } else {
    console.log("timeout")
    // Queue up a refresh for ~1 minute before the token expires
    return (setTimeout(() => {
      const run = async () => {
        const client = createAxiosInstance(apiUrl, headers)
        const newHeaders = await validateToken(client)
        if (newHeaders) {
          onRefresh(newHeaders)
        }
      }
      // eslint-disable-next-line no-void
      void run()
    }, Math.max(ttl - 60000, 0)) as unknown) as number
  }
}

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
