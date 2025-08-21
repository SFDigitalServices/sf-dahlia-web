import React from "react"
import { getListingAddressString } from "../../../util/listingUtil"
import { localizedFormat, formatTimeOfDay } from "../../../util/languageUtil"
import { Button, t } from "@bloom-housing/ui-components"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import fallbackImg from "../../../../assets/images/bg@1200.jpg"

const ListingApplyIntro = () => {
  const formEngineContext = useFormEngineContext()
  const { listingData, handleNextStep } = formEngineContext

  const imageUrl =
    listingData?.Listing_Images?.length > 0
      ? listingData.Listing_Images[0].displayImageURL
      : listingData?.imageURL ?? fallbackImg

  return (
    <>
      <h1>{t("a1Intro.title")}</h1>
      <p>{listingData.Name}</p>
      <p>{getListingAddressString(listingData)}</p>
      <p>
        {t("listingDetails.applicationsDeadline.withDateTime", {
          date: localizedFormat(listingData.Application_Due_Date, "LL"),
          time: formatTimeOfDay(listingData.Application_Due_Date),
        })}
      </p>
      <img src={imageUrl} alt="" />
      <Button onClick={handleNextStep}>Begin</Button>
    </>
  )
}

export default ListingApplyIntro
