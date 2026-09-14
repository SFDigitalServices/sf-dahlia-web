import React from "react"
import { act, render } from "@testing-library/react"
import IdleTimeout from "../../authentication/components/IdleTimeout"
import withAppSetup from "../../layouts/withAppSetup"

jest.mock("../../authentication/components/IdleTimeout", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

describe("withAppSetup", () => {
  it("logs when the idle timeout fires", async () => {
    const Page = withAppSetup(() => <div>page</div>, {})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      render(<Page assetPaths={{}} />)
    })

    const { onTimeout } = jest.mocked(IdleTimeout).mock.calls[0][0]
    onTimeout?.()

    expect(console.log).toHaveBeenCalledWith("Logout")
  })
})
