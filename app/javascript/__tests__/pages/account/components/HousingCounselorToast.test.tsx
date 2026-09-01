import React from "react"
import { screen } from "@testing-library/react"
import { renderAndLoadAsync } from "../../../__util__/renderUtils"
import {
  HousingCounselorNoAccessToast,
  HousingCounselorSignInToast,
  HousingCounselorSignOutToast,
} from "../../../../pages/account/components/HousingCounselorToast"

describe("HousingCounselorToast", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
  })

  it("shows the sign-in message with the seeker's name", async () => {
    await renderAndLoadAsync(<HousingCounselorSignInToast seekerName="Ada Lovelace" />)

    expect(screen.getByRole("alert")).toHaveTextContent("You signed into Ada Lovelace's account")
  })

  it("shows the sign-out message with the seeker's name", async () => {
    await renderAndLoadAsync(<HousingCounselorSignOutToast seekerName="Ada Lovelace" />)

    expect(screen.getByRole("alert")).toHaveTextContent("You signed out of Ada Lovelace's account")
  })

  it("shows the no access message", async () => {
    await renderAndLoadAsync(<HousingCounselorNoAccessToast />)

    expect(screen.getByRole("alert")).toHaveTextContent("You do not have access to this account.")
  })
})
