import React from "react"

import "./how-to-apply.scss"
import Layout from "../../layouts/Layout"
import { t } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { Link } from "@bloom-housing/ui-seeds"

interface HowToApplyProps {
  assetPaths: unknown
}

const HowToApply = (_props: HowToApplyProps) => {
  return (
    <Layout title={t("pageTitle.howToApply")}>
      <section className="flex flex-col justify-center md:px-5">
        <article className="markdown max-w-5xl m-auto">
          <div className="pt-4 md:py-0 max-w-3xl">
            <div className="markdown-section markdown-section--with-padding">
              <div className="markdown-section__inner">
                <article className="markdown">
                  <div className="py-10">
                    <h3 className="text-2xl font-alt-serif pb-6">
                      {t("howToApplyPage.howLongItTakes.title")}
                    </h3>
                    <h4 className="font-alt-sans pb-4">
                      {t("howToApplyPage.howLongItTakes.subtitle1")}
                    </h4>
                    <div className="pb-6">{t("howToApplyPage.howLongItTakes.desc1")}</div>
                    <h4 className="font-alt-sans pb-4">
                      {t("howToApplyPage.howLongItTakes.subtitle2")}
                    </h4>
                    <div>{t("howToApplyPage.howLongItTakes.desc2")}</div>
                  </div>
                  <div className="pb-10">
                    <h3 className="text-2xl font-alt-serif pb-6">
                      {t("howToApplyPage.beforeYouStart.title")}
                    </h3>
                    <h4 className="font-alt-sans pb-4">
                      {t("howToApplyPage.beforeYouStart.subtitle1")}
                    </h4>
                    <div className="pb-2">
                      {t("howToApplyPage.beforeYouStart.eligibilityList.title")}
                    </div>
                    <ul className="mb-0 pb-6">
                      <li>{t("howToApplyPage.beforeYouStart.eligibilityList.listItem1")}</li>
                      <li>{t("howToApplyPage.beforeYouStart.eligibilityList.listItem2")}</li>
                      <li>{t("howToApplyPage.beforeYouStart.eligibilityList.listItem3")}</li>
                      <li>{t("howToApplyPage.beforeYouStart.eligibilityList.listItem4")}</li>
                      <li>{t("listingsForSale.beforeApplying.step5")}</li>
                    </ul>
                    <h4 className="font-alt-sans pb-4">
                      {t("howToApplyPage.beforeYouStart.subtitle2")}
                    </h4>
                    <div className="pb-2">{t("howToApplyPage.beforeYouStart.desc2")}</div>
                  </div>
                  <h3 className="text-2xl font-alt-serif pb-4">{t("listings.apply.howToApply")}</h3>
                  <ol className="process-list">
                    <li>
                      <h4 className="font-alt-sans pb-4">
                        {t("listings.fcfs.bmrSales.howToApply.step1")}
                      </h4>
                      <div className="text-base pb-2">
                        {t("howToApplyPage.howToApply.step1.desc1")}
                      </div>
                      <div className="text-base">{t("howToApplyPage.howToApply.step1.desc2")}</div>
                    </li>
                    <li>
                      <h4 className="font-alt-sans pb-4">
                        {t("listings.fcfs.bmrSales.howToApply.step2")}
                      </h4>
                      <div className="text-base">{t("howToApplyPage.howToApply.step2.desc1")}</div>
                    </li>
                    <li>
                      <h4 className="font-alt-sans pb-4">
                        {t("howToApplyPage.howToApply.step3.title")}
                      </h4>
                      <div className="text-base">{t("howToApplyPage.howToApply.step3.desc1")} </div>
                      <div className="text-base">
                        {t("howToApplyPage.howToApply.step3.desc2")}{" "}
                        <span className="italic">
                          {t("howToApplyPage.howToApply.step3.example")}
                        </span>
                      </div>
                    </li>
                    <li>
                      <h4 className="font-alt-sans pb-4">
                        {t("howToApplyPage.howToApply.step4.title")}
                      </h4>
                      <div className="text-base pb-2">
                        <Link href="#">{t("howToApplyPage.howToApply.step4.link")}</Link>{" "}
                        {t("howToApplyPage.howToApply.step4.desc1")}
                      </div>
                      <div className="text-base">{t("howToApplyPage.howToApply.step4.desc2")}</div>
                    </li>
                    <li>
                      <h4 className="font-alt-sans pb-4">
                        {t("howToApplyPage.howToApply.step5.title")}
                      </h4>
                      <div className="text-base">
                        {t("howToApplyPage.howToApply.step5.list.title")}
                      </div>
                      <ul className="mb-0 pb-2">
                        <li className="text-base">
                          {t("howToApplyPage.howToApply.step5.list.listItem1")}
                        </li>
                        <li className="text-base">
                          {t("howToApplyPage.howToApply.step5.list.listItem2")}
                        </li>
                        <li className="text-base">
                          {t("howToApplyPage.howToApply.step5.list.listItem3")}
                        </li>
                      </ul>
                      <div className="text-base">{t("howToApplyPage.howToApply.step5.desc3")}</div>
                    </li>
                  </ol>
                  <h3 className="text-2xl font-alt-serif pb-4">
                    {t("howToApplyPage.whatHappensNext.title")}
                  </h3>
                  <div className="pb-2">{t("howToApplyPage.whatHappensNext.desc1")}</div>
                  <div className="pb-2">{t("howToApplyPage.whatHappensNext.desc2")}</div>
                  <Link href="#">{t("listings.fcfs.bmrSales.noLotteryRequired.footer")}</Link>
                </article>
              </div>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  )
}

export default withAppSetup(HowToApply, true)
