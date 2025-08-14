import ListingApplyFormLayout from "../layouts/ListingApplyFormLayout"
import ListingApplyIntro from "../pages/form/components/listingApplyIntro"
import ListingApplyOverview from "../pages/form/components/listingApplyOverview"
import ListingApplyStepWrapper from "../pages/form/components/listingApplyStepWrapper"
import Name from "../pages/form/components/name"
import DateOfBirth from "../pages/form/components/dateOfBirth"
import EmailAddress from "../pages/form/components/emailAddress"
import Phone from "../pages/form/components/phone"
import Address from "../pages/form/components/address"
import YesNoRadio from "../pages/form/components/yesNoRadio"
import ListingApplyReviewTerms from "../pages/form/components/listingApplyReviewTerms"

export default function getFormComponentRegistry() {
  return {
    ListingApplyFormLayout,
    ListingApplyIntro,
    ListingApplyOverview,
    ListingApplyStepWrapper,
    Name,
    DateOfBirth,
    EmailAddress,
    Phone,
    Address,
    YesNoRadio,
    ListingApplyReviewTerms,
  }
}
