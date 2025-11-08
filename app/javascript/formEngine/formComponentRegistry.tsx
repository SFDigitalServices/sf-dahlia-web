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
import ListingApplyHouseholdIntro from "../pages/form/components/ListingApplyHouseholdIntro"
import ListingApplyHouseholdOverview from "../pages/form/components/ListingApplyHouseholdOverview"
import AddHouseholdMembers from "../pages/form/components/AddHouseholdMembers"
import Select from "../pages/form/components/Select"
import Radio from "../pages/form/components/Radio"
import VeteransRadio from "../pages/form/components/VeteransRadio"
import Currency from "../pages/form/components/Currency"
import AlternateContactType from "../pages/form/components/AlternateContactType"
import HouseholdMemberSameAddress from "../pages/form/components/HouseholdMemberSameAddress"
import MonthlyRent from "../pages/form/components/MonthlyRent"
import PrioritiesCheckbox from "../pages/form/components/PrioritiesCheckbox"
import PreferenceCheckboxGroup from "../pages/form/components/PreferenceCheckboxGroup"
import ListingApplyLiveWorkPreference from "../pages/form/components/ListingApplyLiveWorkPreference"
import CertificateNumberPreference from "../pages/form/components/CertificateNumberPreference"
import IncomeVoucherDescription from "../pages/form/components/IncomeVoucherDescription"
import HouseholdIncomeDescription from "../pages/form/components/HouseholdIncomeDescription"
import VeteransDescription from "../pages/form/components/VeteransDescription"

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
    AddHouseholdMembers,
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
    HouseholdMemberSameAddress,
    MonthlyRent,
    PrioritiesCheckbox,
    PreferenceCheckboxGroup,
    CertificateNumberPreference,
    // Other components
    IncomeVoucherDescription,
    HouseholdIncomeDescription,
    VeteransDescription,
  }
}
