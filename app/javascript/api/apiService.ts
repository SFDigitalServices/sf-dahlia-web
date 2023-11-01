import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

import { setAuthHeaders, getHeaders } from "../authentication/token"

// Use this function for authenticated calls
const createAxiosInstance = (): AxiosInstance => {
  if (!getHeaders()) {
    throw new Error("Unauthorized. Sign in first")
  }

  return axios.create({
    headers: getHeaders(),
    transformResponse: (res, headers) => {
      if (headers["access-token"]) {
        setAuthHeaders(headers)
      }
      return JSON.parse(res)
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
): Promise<AxiosResponse<T>> => axios.post(url, data, config)

export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const queryParams = config ? { ...config.params } : {}
  if (window.location.search.includes("preview=true")) {
    queryParams.force = "true"
  }
  return axios.get(url, { ...config, params: queryParams })
}

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
