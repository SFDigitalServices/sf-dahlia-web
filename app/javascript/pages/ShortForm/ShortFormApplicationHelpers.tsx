/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEventHandler } from "react"

export type RailsShortFormResponse = {
  application: RailsShortFormApplication
}
export type RailsShortFormApplication = {
  totalMonthlyRent?: string
  status?: string
  shortFormPreferences?: string
  referral?: string
  primaryApplicant?: {
    firstName?: string
    lastName?: string
    email?: string
    dateOfBirth?: string
  }
  otherHousingCounselingAgency?: string
  name?: string
  monthlyIncome?: string
  lotteryNumberManual?: string
  lotteryNumber?: string
  listingID?: string
  lendingAgent?: string
  jobClassification?: string
  isVeteranInHousehold?: string
  isSFUSDEmployee?: string
  isPrimaryApplicantVeteran?: string
  isNonPrimaryMemberVeteran?: string
  isFirstTimeHomebuyer?: string
  id?: string
  housingCounselingAgency?: string
  householdVouchersSubsidies?: string
  householdMembers?: string
  homebuyerEducationAgency?: string
  hasSenior?: string
  hasPublicHousing?: string
  hasMinimumCreditScore?: string
  hasMilitaryService?: string
  hasLoanPreapproval?: string
  hasDisability?: string
  hasDevelopmentalDisability?: string
  hasCompletedHomebuyerEducation?: string
  formMetadata?: string
  externalSessionId?: string
  didApplicantUseHousingCounselingAgency?: string
  appRTType?: string
  applicationSubmittedDate?: string
  applicationSubmissionType?: string
  applicationLanguage?: string
  answeredCommunityScreening?: string
  annualIncome?: string
  alternateContact?: string
  agreeToTerms?: string
  adaPrioritiesSelected?: string
}

export const ApplicationInput = (props: {
  label: string
  type?: string
  name?: string
  value?: string
  onChange?: ChangeEventHandler
  ref?: any
}) => {
  const { label, type = "text", name, value, onChange, ref } = props

  return (
    <div className="ApplicationInput">
      <label>{label}</label>
      <input ref={ref} type={type} name={name} value={value} onChange={onChange} />
    </div>
  )
}
