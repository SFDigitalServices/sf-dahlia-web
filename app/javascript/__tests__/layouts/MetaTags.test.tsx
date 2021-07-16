import React from "react"

import { shallow } from "enzyme"

import MetaTags from "../../layouts/MetaTags"

describe("<MetaTags />", () => {
  it("renders a title correctly", () => {
    const wrapper = shallow(<MetaTags title="The Title" />)
    expect(wrapper.find("title").text()).toBe("The Title")
  })

  it("renders a default title", () => {
    const wrapper = shallow(<MetaTags />)
    expect(wrapper.find("title").text()).toBe("DAHLIA San Francisco Housing Portal")
  })

  it("renders a description", () => {
    const wrapper = shallow(<MetaTags description="The Description" />)
    expect(wrapper.find("meta[property='og:description']").prop("content")).toBe("The Description")
  })
})
