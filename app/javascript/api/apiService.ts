import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios"

import { getHeaders } from "../authentication/token"

// Use this function for authenticated calls
const createAxiosInstance = (): AxiosInstance => {
  if (!getHeaders()) {
    throw new Error("Unauthorized. Sign in first")
  }
  return axios.create()
}

export const put = <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => axios.put(url, data, config)

export const post = <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => axios.post(url, data, config)

export const get = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => axios.get(url, config)

/*
 * "delete" is a reserved word in TS so we couldn't name it that
 */
export const apiDelete = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => axios.delete(url, config)

export const authenticatedPut = <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().put(url, data, config)

export const authenticatedPost = <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().post(url, data, config)

export const authenticatedGet = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().get(url, config)

export const authenticatedDelete = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<AxiosResponse<T>> => createAxiosInstance().delete(url, config)
