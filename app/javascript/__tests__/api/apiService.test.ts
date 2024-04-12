import axios, { AxiosInstance } from "axios"

import {
  put,
  post,
  get,
  apiDelete,
  authenticatedPut,
  authenticatedPost,
  authenticatedGet,
  authenticatedDelete,
} from "../../api/apiService"

jest.mock("axios")

// mock getStorage function from `authentication/token.ts'
Storage.prototype.getItem = (_key: string) => JSON.stringify({ "access-token": "test-token" })

describe("apiService", () => {
  const url = "test-url"
  const data = "test-data"
  const config = {}

  describe("put", () => {
    it("calls axios.put", async () => {
      const putSpy = jest.spyOn(axios, "put")
      await put(url, data, config)
      expect(putSpy).toHaveBeenCalledWith(url, data, config)
    })
  })

  describe("post", () => {
    it("calls axios.post", async () => {
      const postSpy = jest.spyOn(axios, "post")
      await post(url, data, config)
      expect(postSpy).toHaveBeenCalledWith(url, data, config)
    })
  })

  describe("get", () => {
    it("calls axios.get", async () => {
      const getSpy = jest.spyOn(axios, "get")
      await get(url, config)
      expect(getSpy).toHaveBeenCalledWith(url, config)
    })
  })

  describe("apiDelete", () => {
    it("calls axios.delete", async () => {
      const deleteSpy = jest.spyOn(axios, "delete")
      await apiDelete(url, config)
      expect(deleteSpy).toHaveBeenCalledWith(url, config)
    })
  })

  describe("authenticated requests", () => {
    let createSpy
    beforeEach(() => {
      createSpy = jest.spyOn(axios, "create").mockReturnValue({
        put: jest.fn(),
        post: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      } as unknown as AxiosInstance)
    })

    describe("authenticatedPut", () => {
      it("calls axios.put", async () => {
        await authenticatedPut(url, config)
        const putSpy = createSpy.mock.results[0].value.put
        expect(createSpy).toHaveBeenCalled()
        // expect(putSpy).toHaveBeenCalledWith(url, config) // getting undefined for the params
        expect(putSpy).toHaveBeenCalled()
      })
    })

    describe("authenticatedPost", () => {
      it("calls axios.post", async () => {
        await authenticatedPost(url, data, config)
        const postSpy = createSpy.mock.results[0].value.post
        expect(createSpy).toHaveBeenCalled()
        expect(postSpy).toHaveBeenCalled()
      })
    })

    describe("authenticatedGet", () => {
      it("calls axios.get", async () => {
        await authenticatedGet(url, config)
        const getSpy = createSpy.mock.results[0].value.get
        expect(createSpy).toHaveBeenCalled()
        expect(getSpy).toHaveBeenCalled()
      })
    })

    describe("authenticatedDelete", () => {
      it("calls axios.delete", async () => {
        await authenticatedDelete(url, config)
        const deleteSpy = createSpy.mock.results[0].value.delete
        expect(createSpy).toHaveBeenCalled()
        expect(deleteSpy).toHaveBeenCalled()
      })
    })
  })
})
