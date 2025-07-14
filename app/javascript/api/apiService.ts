import axios, { AxiosInstance, AxiosResponse } from "axios"
import type { AxiosRequestConfig } from "axios"

import { setAuthHeaders, getHeaders, isTokenValid } from "../authentication/token"

// Use this function for authenticated calls
const createAxiosInstance = (): AxiosInstance => {
  const headers = getHeaders()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!headers || Object.keys(headers).length === 0) {
    throw new Error("Unauthorized")
  }
  if (!isTokenValid()) {
    throw new Error("Token expired")
  }
  return axios.create({
    headers: getHeaders(),
    transformResponse: (res, headers) => {
      if (headers["access-token"]) {
        setAuthHeaders(headers)
      }
      return res ? JSON.parse(res as string) : {}
    },
  })
}

export const put = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => axios.put(url, data, config)

export const post = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axios.post(url, data, config)
}

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  axios.get(url, config)

/*
 * "delete" is a reserved word in TS so we couldn't name it that
 */
export const apiDelete = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  axios.delete(url, config)

export const authenticatedPut = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().put(url, data, config)

export const authenticatedPost = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().post(url, data, config)

export const authenticatedGet = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().get(url, config)

export const authenticatedDelete = <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().delete(url, config)
