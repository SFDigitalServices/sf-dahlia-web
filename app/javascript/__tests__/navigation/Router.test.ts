import Router from "../../navigation/Router"

const MOCK_LOCATION = {
  pathname: "/path/name",
  search: "?search=param",
  origin: "http://www.test.com",
  href: "http://www.test.com/path/name?search=param",
}

describe("Router", () => {
  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: {
        location: MOCK_LOCATION,
      },
    })
  })

  describe("pathname", () => {
    it("returns the correct pathname", () => {
      expect(Router.pathname).toEqual(MOCK_LOCATION.pathname)
    })

    it("updates the pathname when window pathname changes", () => {
      expect(Router.pathname).toEqual(MOCK_LOCATION.pathname)
      window.location.pathname = "/new/pathname"
      expect(Router.pathname).toEqual("/new/pathname")
    })
  })

  describe("asPath", () => {
    it("returns the correct asPath", () => {
      expect(Router.asPath).toEqual(MOCK_LOCATION.pathname + MOCK_LOCATION.search)
    })

    it("updates asPath when window pathname changes", () => {
      expect(Router.asPath).toEqual(MOCK_LOCATION.pathname + MOCK_LOCATION.search)
      window.location.pathname = "/new/pathname"
      expect(Router.asPath).toEqual("/new/pathname" + MOCK_LOCATION.search)
    })
  })

  describe("push", () => {
    it("updates the URL when no options are passed", () => {
      expect(window.location.href).toEqual(MOCK_LOCATION.href)
      Router.push("/new/href?with=searchparam")
      expect(window.location.href).toEqual("/new/href?with=searchparam")
    })

    it("switches language if param is provided and start url is english", () => {
      expect(window.location.href).toEqual(MOCK_LOCATION.href)
      Router.push("/new/href?with=searchparam", null, { locale: "es" })
      expect(window.location.href).toEqual("/es/new/href?with=searchparam")
    })

    it("switches language if param is provided and start url is spanish", () => {
      expect(window.location.href).toEqual(MOCK_LOCATION.href)
      Router.push("/es/new/href?with=searchparam", null, { locale: "zh" })
      expect(window.location.href).toEqual("/zh/new/href?with=searchparam")
    })

    it("does not change url if locale param is same language as url", () => {
      expect(window.location.href).toEqual(MOCK_LOCATION.href)
      Router.push("/zh/new/href?with=searchparam", null, { locale: "zh" })
      expect(window.location.href).toEqual("/zh/new/href?with=searchparam")
    })
  })
})
