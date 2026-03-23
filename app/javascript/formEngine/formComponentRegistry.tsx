import ListingApplyIntro from "../pages/form/components/ListingApplyIntro"
import ListingApplyOverview from "../pages/form/components/ListingApplyOverview"
import ListingApplyStepWrapper from "../pages/form/components/ListingApplyStepWrapper"
import Name from "../pages/form/components/Name"
import DateOfBirth from "../pages/form/components/DateOfBirth"
import EmailAddress from "../pages/form/components/EmailAddress"
import Phone from "../pages/form/components/Phone"
import Address from "../pages/form/components/Address"
import YesNoRadio from "../pages/form/components/YesNoRadio"
import ListingApplyTerms from "../pages/form/components/ListingApplyTerms"
import ListingApplyFormWrapper from "../pages/form/components/ListingApplyFormWrapper"
import VerifyAddress from "../pages/form/components/VerifyAddress"
import ListingApplyDemographics from "../pages/form/components/ListingApplyDemographics"
import ListingApplyPreferencesIntro from "../pages/form/components/ListingApplyPreferencesIntro"
import ListingApplyRentBurdenPreference from "../pages/form/components/ListingApplyRentBurdenPreference"
import ListingApplyReviewSummary from "../pages/form/components/ListingApplyReviewSummary"
import ListingApplyReviewApplication from "../pages/form/components/ListingApplyReviewApplication"
import ListingApplyHouseholdIntro from "../pages/form/components/household/ListingApplyHouseholdIntro"
import ListingApplyHouseholdOverview from "../pages/form/components/household/ListingApplyHouseholdOverview"
import ListingApplyPublicHousingHeader from "../pages/form/components/ListingApplyPublicHousingHeader"
import HouseholdMemberMultiStepWrapper from "../pages/form/components/household/HouseholdMemberMultiStepWrapper"
import Select from "../pages/form/components/Select"
import Radio from "../pages/form/components/Radio"
import VeteransRadio from "../pages/form/components/VeteransRadio"
import Currency from "../pages/form/components/Currency"
import AlternateContactType from "../pages/form/components/AlternateContactType"
import MonthlyRent from "../pages/form/components/MonthlyRent"
import PrioritiesCheckbox from "../pages/form/components/PrioritiesCheckbox"
import PreferenceCheckboxGroup from "../pages/form/components/PreferenceCheckboxGroup"
import ListingApplyLiveWorkPreference from "../pages/form/components/ListingApplyLiveWorkPreference"
import CertificateNumberPreference from "../pages/form/components/CertificateNumberPreference"
import ListingApplyIncomeVouchersHeader from "../pages/form/components/ListingApplyIncomeVouchersHeader"
import ListingApplyHouseholdIncomeHeader from "../pages/form/components/ListingApplyHouseholdIncomeHeader"
import ListingApplyVeteransProgramsHeader from "../pages/form/components/ListingApplyVeteransProgramsHeader"
import ListingApplyHouseholdPrioritiesHeader from "../pages/form/components/ListingApplyHouseholdPrioritiesHeader"

export default function getFormComponentRegistry() {
  return {
    ListingApplyFormWrapper,
    // Step-level components
    ListingApplyIntro,
    ListingApplyOverview,
    ListingApplyStepWrapper,
    VerifyAddress,
    ListingApplyHouseholdIntro,
    ListingApplyHouseholdOverview,
    HouseholdMemberMultiStepWrapper,
    ListingApplyPreferencesIntro,
    ListingApplyLiveWorkPreference,
    ListingApplyRentBurdenPreference,
    ListingApplyDemographics,
    ListingApplyReviewSummary,
    ListingApplyTerms,
    ListingApplyReviewApplication,
    // Field-level components
    Select,
    Radio,
    YesNoRadio,
    VeteransRadio,
    Name,
    DateOfBirth,
    EmailAddress,
    Phone,
    Address,
    Currency,
    AlternateContactType,
    MonthlyRent,
    PrioritiesCheckbox,
    PreferenceCheckboxGroup,
    CertificateNumberPreference,
    // Other components
    ListingApplyPublicHousingHeader,
    ListingApplyIncomeVouchersHeader,
    ListingApplyHouseholdIncomeHeader,
    ListingApplyVeteransProgramsHeader,
    ListingApplyHouseholdPrioritiesHeader,
  }
}
