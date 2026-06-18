import { ContentAccordion, t } from "@bloom-housing/ui-components"
import React from "react"
import AssistanceLayout from "../../layouts/HeaderSidebarLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { getSfGovUrl, renderInlineMarkup } from "../../util/languageUtil"
import { PREFERENCES_IDS } from "../../modules/constants"
import useTranslate from "../../hooks/useTranslate"
import { AppPages } from "../../util/routeUtil"
import {
  InformationalCallout,
  InformationalContent,
  InformationalDivider,
  InformationalHeaderGroup,
  InformationalSection,
  InformationalStack,
} from "../../components/informational/InformationalPageElements"

const DocumentChecklist = () => {
  // false means useTranslate will not be disabled when GoogleCloudTranslate is enabled
  useTranslate(false)
  const anchor = window.location.href.split("#").pop()
  const preferences = [
    {
      id: PREFERENCES_IDS.neighborhoodResidence,
      title: t("listings.lotteryPreference.Neighborhood Resident Housing Preference (NRHP).title"),
      expanded: (
        <div className="space-y-2.5">
          <p>{renderInlineMarkup(t("documentChecklist.nrhpDoc1"), "<ul><li>")}</p>
          <p>{t("documentChecklist.nrhpDoc2")}</p>
          <ul className="info-template-list info-template-list--unordered">
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
          <ol className="info-template-list info-template-list--ordered info-template-list--compact">
            <li>
              <p className="pb-2.5">{t("documentChecklist.liveSfDesc")}</p>
              <ul className="info-template-list info-template-list--unordered info-template-list--nested">
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
              <ul className="info-template-list info-template-list--unordered info-template-list--nested">
                <li>{t("label.proof.paystubEmployer")}</li>
                <li>{t("label.proof.letterFromEmployer")}</li>
              </ul>
            </li>
          </ol>
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
                url: getSfGovUrl("https://sf.gov/learn-about-certificate-preference-cop"),
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
                url: getSfGovUrl("https://sf.gov/displaced-tenant-housing-preference-program-dthp"),
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
          <ol className="info-template-list info-template-list--ordered">
            <li>
              <p className="pb-2.5">
                {renderInlineMarkup(t("documentChecklist.assistedHousingDesc"))}
              </p>
              <ul className="info-template-list info-template-list--unordered">
                <li>
                  <p className="pb-2.5">{t("label.proof.leaseAgreement")}</p>
                </li>
              </ul>
            </li>
            <li>
              <p className="pb-2.5">{t("documentChecklist.rentBurdenDoc1")}</p>
              <ol className="info-template-list info-template-list--ordered info-template-list--lower-alpha">
                <li>
                  <p>{t("label.proof.leaseAgreement")}</p>
                </li>
                <li>
                  <p className="pb-2.5">{t("documentChecklist.rentBurdenDoc2")}</p>
                  <ul className="info-template-list info-template-list--unordered">
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
      id: PREFERENCES_IDS.rightToReturn,
      title: t("documentChecklist.hopeSfTitle"),
      expanded: (
        <div className="space-y-2.5">
          {/* When there are human translated strings, those will take precedence */}
          <p className="translate">{t("documentChecklist.hopeSf.p1")}</p>
          <p className="translate">{t("documentChecklist.hopeSf.p2")}</p>
          <ul className="info-template-list info-template-list--unordered">
            <li className="translate">{t("label.proof.sfhaLetterVerifyingResidency")}</li>
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
    <div id={pref.id} key={pref.id}>
      <ContentAccordion
        customBarContent={pref.title}
        customExpandedContent={<InformationalCallout>{pref.expanded}</InformationalCallout>}
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
      <InformationalContent>
        <InformationalSection>
          <InformationalHeaderGroup>
            <h2>{t("documentChecklist.preferenceHeader")}</h2>
            <p>{t("documentChecklist.p1")}</p>
            <p>{t("documentChecklist.p2")}</p>
            <p>
              {renderInlineMarkup(
                t("documentChecklist.p3", {
                  url: getSfGovUrl(
                    "https://sf.gov/information/learn-about-housing-lottery-preference-programs"
                  ),
                })
              )}
            </p>
          </InformationalHeaderGroup>
          {preferences}
        </InformationalSection>
        <InformationalDivider />
        <InformationalSection>
          <InformationalStack>
            <h2>{t("documentChecklist.homebuyerHeader")}</h2>
            <p>{t("documentChecklist.homebuyerDesc")}</p>
            <ol className="info-template-list info-template-list--ordered">
              <li>{t("documentChecklist.homebuyerEducationDesc")}</li>
              <li>
                {renderInlineMarkup(
                  t("documentChecklist.homebuyerLoanDesc", {
                    url: getSfGovUrl(
                      "https://sf.gov/reports/february-2023/find-lender-below-market-rate-program"
                    ),
                  })
                )}
              </li>
            </ol>
            <p>{t("label.applicationUploadBothDocuments")}</p>
          </InformationalStack>
        </InformationalSection>
      </InformationalContent>
    </AssistanceLayout>
  )
}

export default withAppSetup(DocumentChecklist, { pageName: AppPages.DocumentChecklist })
