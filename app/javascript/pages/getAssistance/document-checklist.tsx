import { ContentAccordion, t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { getSfGovUrl, renderInlineMarkup } from "../../util/languageUtil"
import { PREFERENCES_IDS } from "../../modules/constants"

const DocumentChecklist = () => {
  const anchor = window.location.href.split("#").pop()
  const preferences = [
    {
      id: PREFERENCES_IDS.neighborhoodResidence,
      title: t("listings.lotteryPreference.Neighborhood Resident Housing Preference (NRHP).title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.nrhpDoc1"), "<ul><li>")}</p>
          <p>{t("documentChecklist.nrhpDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.telephoneBill")}</li>
            <li>{t("label.proof.cableBill")}</li>
            <li>{t("label.proof.electricBill")}</li>
            <li>{t("label.proof.gasBill")}</li>
            <li>{t("label.proof.waterBill")}</li>
            <li>{t("label.proof.paystubHome")}</li>
            <li>{t("label.proof.publicBenefits")}</li>
            <li>{t("label.proof.schoolRecord")}</li>
            <li>{t("label.proof.homelessness")}</li>
          </ul>
        </div>
      ),
    },
    {
      id: PREFERENCES_IDS.liveWorkInSf,
      title: t("listings.lotteryPreference.Live or Work in San Francisco Preference.title"),
      expanded: (
        <div>
          <p className="pb-2.5">{t("documentChecklist.twoWaysDesc")}</p>
          <ul className="space-y-2.5 list-decimal ml-7">
            <li>
              <p className="pb-2.5">{t("documentChecklist.liveSfDesc")}</p>
              <ul className="list-disc ml-2">
                <li>{t("label.proof.telephoneBill")}</li>
                <li>{t("label.proof.cableBill")}</li>
                <li>{t("label.proof.electricBill")}</li>
                <li>{t("label.proof.gasBill")}</li>
                <li>{t("label.proof.waterBill")}</li>
                <li>{t("label.proof.paystubHome")}</li>
                <li>{t("label.proof.publicBenefits")}</li>
                <li>{t("label.proof.schoolRecord")}</li>
                <li>{t("label.proof.homelessness")}</li>
              </ul>
            </li>
            <li>
              <p className="pb-2.5">{t("documentChecklist.workSfDesc")}</p>
              <ul className="list-disc ml-2">
                <li>{t("label.proof.paystubEmployer")}</li>
                <li>{t("label.proof.letterFromEmployer")}</li>
              </ul>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: PREFERENCES_IDS.certificateOfPreference,
      title: t("e7PreferencesPrograms.certOfPreference"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.copDoc1")}</p>
          <p>
            {renderInlineMarkup(
              t("documentChecklist.copDoc2", {
                url: getSfGovUrl("https://sf.gov/learn-about-certificate-preference-cop", 3275),
              })
            )}
          </p>
        </div>
      ),
    },
    {
      id: PREFERENCES_IDS.displacedTenant,
      title: t("e7PreferencesPrograms.displaced"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.dthpDoc1"))}</p>
          <p>{renderInlineMarkup(t("documentChecklist.dthpDoc2"), "<ul><li>")}</p>
          <p>
            {renderInlineMarkup(
              t("documentChecklist.dthpDoc3", {
                url: getSfGovUrl(
                  "https://sf.gov/displaced-tenant-housing-preference-program-dthp",
                  7488
                ),
              })
            )}
          </p>
        </div>
      ),
    },
    {
      id: PREFERENCES_IDS.assistedHousing,
      title: t("listings.lotteryPreference.Rent Burdened / Assisted Housing Preference.title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.ociiSponsored"))}</p>
          <p>{t("documentChecklist.twoWaysDesc")}</p>
          <ol className="list-decimal ml-7">
            <li>
              <p className="pb-2.5">
                {renderInlineMarkup(t("documentChecklist.assistedHousingDesc"))}
              </p>
              <ul className="list-disc ml-7">
                <li>
                  <p className="pb-2.5">{t("label.proof.leaseAgreement")}</p>
                </li>
              </ul>
            </li>
            <li>
              <p className="pb-2.5">{t("documentChecklist.rentBurdenDoc1")}</p>
              <ol style={{ listStyleType: "lower-alpha" }} className="ml-7">
                <li>
                  <p>{t("label.proof.leaseAgreement")}</p>
                </li>
                <li>
                  <p className="pb-2.5">{t("documentChecklist.rentBurdenDoc2")}</p>
                  <ul className="list-disc ml-7">
                    <li>{t("label.proof.moneyOrder")}</li>
                    <li>{t("label.proof.cancelledCheck")}</li>
                    <li>{t("label.proof.debitFromBank")}</li>
                    <li>{t("label.proof.onlinePayment")}</li>
                  </ul>
                </li>
              </ol>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: PREFERENCES_IDS.aliceGriffith,
      title: t("documentChecklist.hopeSfTitle"),
      expanded: (
        <div className="space-y-2.5">
          <p>{t("documentChecklist.hopeSfDoc1")}</p>
          <p>{t("documentChecklist.hopeSfDoc2")}</p>
          <ul className="list-disc ml-7">
            <li>{t("label.proof.sfhaResidencyLetter")}</li>
            <li>{t("label.proof.sfhaLease")}</li>
            <li>{t("label.proof.sfCityId")}</li>
            <li>{t("label.proof.telephoneBill")}</li>
            <li>{t("label.proof.cableBill")}</li>
            <li>{t("label.proof.paystubHome")}</li>
            <li>{t("label.proof.publicBenefits")}</li>
            <li>{t("label.proof.schoolRecord")}</li>
          </ul>
        </div>
      ),
    },
  ].map((pref) => (
    <div id={pref.id}>
      <ContentAccordion
        customBarContent={pref.title}
        customExpandedContent={
          <div className="p-5 rounded-b-lg border-2 border-gray-400">{pref.expanded}</div>
        }
        accordionTheme={"gray"}
        initialExpanded={pref.id === anchor}
      />
    </div>
  ))
  return (
    <AssistanceLayout
      title={t("assistance.title.documentChecklist")}
      subtitle={t("assistance.subtitle.documentChecklist")}
    >
      {
        <div className="flex flex-col w-full ">
          <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
            <h2>{t("documentChecklist.preferenceHeader")}</h2>
            <p>{t("documentChecklist.p1")}</p>
            <p>{t("documentChecklist.p2")}</p>
            <p>
              {renderInlineMarkup(
                t("documentChecklist.p3", {
                  url: getSfGovUrl(
                    "https://sf.gov/information/learn-about-housing-lottery-preference-programs",
                    3274
                  ),
                })
              )}
            </p>

            {preferences}
          </div>
          <div className="md:pr-11 md:pl-0">
            <hr />
          </div>
          <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
            <h2>{t("documentChecklist.homebuyerHeader")}</h2>
            <p>{t("documentChecklist.homebuyerDesc")}</p>
            <ol className="list-decimal ml-7">
              <li>{t("documentChecklist.homebuyerEducationDesc")}</li>
              <li>
                {renderInlineMarkup(
                  t("documentChecklist.homebuyerLoanDesc", {
                    url: getSfGovUrl(
                      "https://sf.gov/reports/february-2023/find-lender-below-market-rate-program",
                      6953
                    ),
                  })
                )}
              </li>
            </ol>
            <p>{t("label.applicationUploadBothDocuments")}</p>
          </div>
        </div>
      }
    </AssistanceLayout>
  )
}

export default withAppSetup(DocumentChecklist)
