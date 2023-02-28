import React from "react"
import { TextTruncate } from "../../components/TextTruncate"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("TextTruncate", () => {
  it("truncates a string and adds an ellipsis when longer than 400 characters", async () => {
    const content =
      "<p>As of 01/04/2022, there are 5 applications pending review for the remaining 2-Bedroom BMR unit. The application period began on 05/03/2021 at 8:00 AM PT. If interested, please submit an electronic application via the <a href='https://sfgov.sharefile.com/r-r0e94bc6e933c4409b19032e518b53e09' target='_blank'>ShareFile secure link</a>.</p><p><br></p><p><br></p><p>Instructions: Compile the <a href='https://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Ownership%20Paper%20Applications/BMR%20Homeownership%20Full%20Application%2005.2021.pdf' target='_blank'>application form </a>and all required documents into one PDF file, and name the PDF file “MIRASF – Last Name, First Name” (Example, 123 Sample Street Unit A – Smith, John). Use the divider pages and place the corresponding documentation behind each divider page. Applications received in multiple files, an incorrect order, formats other than PDF or without supporting documents will not be accepted or reviewed.  If you do not have internet access or are unable to submit electronically, please contact a housing counselor for assistance.</p><p><br></p><p><br></p><p><span style='background-color: rgb(255, 255, 255); font-size: 11pt; font-family: Calibri, sans-serif; color: black;'>For the First Come First Served available unit details including sales price and HOA dues, please view the </span><a href='https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/MIRA%20FCFS%20Available%20Units%20List%201.4.22.pdf' target='_blank' style='background-color: rgb(255, 255, 255); font-size: 14px; font-family: Calibri, sans-serif; color: rgb(0, 119, 218);'>MIRA BMR Unit Matrix</a><span style='background-color: rgb(255, 255, 255); color: rgb(62, 62, 60);'>.</span></p>"
    const { queryByText } = await renderAndLoadAsync(<TextTruncate text={content} />)

    // Check that there is no ellipsis
    expect(queryByText(/\.\.\./)).toBeNull()
  })
})
