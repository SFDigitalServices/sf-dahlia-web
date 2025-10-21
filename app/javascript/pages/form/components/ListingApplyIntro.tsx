import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading, Message } from "@bloom-housing/ui-seeds"
import { getListingAddressString } from "../../../util/listingUtil"
import { localizedFormat, formatTimeOfDay } from "../../../util/languageUtil"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import fallbackImg from "../../../../assets/images/bg@1200.jpg"
import "./ListingApplyIntro.scss"
import { getSignInPath } from "../../../util/routeUtil"

const ListingApplyIntro = () => {
  const formEngineContext = useFormEngineContext()
  const { listing, handleNextStep } = formEngineContext

  const imageUrl =
    listing?.Listing_Images?.length > 0
      ? listing.Listing_Images[0].displayImageURL
      : (listing?.imageURL ?? fallbackImg)

  return (
    <div className="listing-apply-intro">
      <Heading priority={1} size="2xl" className="listing-apply-intro-title">
        {t("a1Intro.title")}
      </Heading>
      <div className="listing-apply-intro-image">
        <div className="listing-apply-intro-image-text">
          <p className="listing-apply-intro-name">{listing.Name}</p>
          <p className="listing-apply-intro-address">{getListingAddressString(listing)}</p>
        </div>
        <img src={imageUrl} alt={`${listing.Name}`} />
      </div>
      <Message variant="primary-inverse" className="listing-apply-intro-message">
        {t("listingDetails.applicationsDeadline.withDateTime", {
          date: localizedFormat(listing.Application_Due_Date, "LL"),
          time: formatTimeOfDay(listing.Application_Due_Date),
        })}
      </Message>
      <Heading priority={2} size="xl">
        {t("languages.choose")}
      </Heading>
      <div className="listing-apply-intro-buttons">
        <Button variant="primary-outlined" onClick={() => handleNextStep()}>
          Begin
        </Button>
        <Button variant="primary-outlined" onClick={() => handleNextStep()}>
          Empezar
        </Button>
        <Button variant="primary-outlined" onClick={() => handleNextStep()}>
          開始
        </Button>
        <Button variant="primary-outlined" onClick={() => handleNextStep()}>
          Magsimula
        </Button>
      </div>
      <hr />
      <div className="listing-apply-intro-footer">
        <Heading priority={2} size="2xl">
          {t("createAccount.alreadyHaveAccount")}
        </Heading>
        <p>{t("a1Intro.signInSaveTime")}</p>
        <Button variant="primary-outlined" href={getSignInPath()}>
          {t("label.signIn")}
        </Button>
      </div>
    </div>
  )
}

export default ListingApplyIntro
