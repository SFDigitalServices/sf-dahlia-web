import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { t, Icon, Button } from "@bloom-housing/ui-components"
import { Card, Heading } from "@bloom-housing/ui-seeds"
import { ApplicationItem } from "../../components/ApplicationItem"
import { getLocalizedPath } from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"

const MyApplications = () => {
  const noApplications = () => {
    return (
      <Card.Section className="flex flex-col bg-primary-lighter items-center pb-12 border-t">
        <h2 className="text-xl">{t("myApplications.noApplications")}</h2>
        <div className="flex flex-col gap-y-4 w-3/5 pt-4">
          <Button
            onClick={() =>
              (window.location.href = getLocalizedPath("/listings/for-rent", getCurrentLanguage()))
            }
          >
            {t("listings.browseRentals")}
          </Button>
          <Button
            onClick={() =>
              (window.location.href = getLocalizedPath("/listings/for-sale", getCurrentLanguage()))
            }
          >
            {t("listings.browseSales")}
          </Button>
        </div>
      </Card.Section>
    )
  }

  return (
    <Layout
      children={
        <section className="bg-gray-300 border-t border-gray-450">
          <div className="flex flex-wrap relative max-w-2xl mx-auto sm:py-8">
            <Card className="w-full">
              <Card.Header className="flex justify-center w-full flex-col items-center pb-8">
                <div
                  className="py-4 border-blue-500 w-min px-4 md:px-8 mb-6"
                  style={{ borderBottom: "3px solid" }}
                >
                  <Icon size="xlarge" className="md:hidden block" symbol={"application"} />
                  <Icon size="2xl" className="md:block hidden" symbol={"application"} />
                </div>
                <Heading priority={1} size="2xl">
                  {t("myApplications.title")}
                </Heading>
              </Card.Header>
              {/* TODO: Headings only display if both rental and sales applications exist */}
              <Heading className="text-xl border-t border-gray-450 px-6 py-4" priority={2}>
                {t("listings.rentalUnits")}
              </Heading>
              <Heading className="text-xl border-t border-gray-450 px-6 py-4" priority={2}>
                {t("listings.saleUnits")}
              </Heading>
              {/* Component if application is submitted */}
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"#12345678"}
                editedDate={"June 1, 2024"}
                listingAddress={"1 Listing Address St, San Francisco CA, 94102"}
                listingName={"Submitted, no results"}
                listingURL={"/listing/abcd1234/listing-name"}
                lotteryComplete={false}
                submitted
              />
              {/* Component if application is submitted with lottery results and error */}
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"#12345678"}
                editedDate={"June 1, 2024"}
                listingAddress={"1 Listing Address St, San Francisco CA, 94102"}
                listingName={"Submitted, download results"}
                listingURL={"/listing/abcd1234/listing-name"}
                lotteryResultsURL={"lotteryResults.pdf"}
                lotteryComplete
                lotteryError
                submitted
              />
              {/* Component if application is submitted with lottery results and no error */}
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"#12345678"}
                editedDate={"June 1, 2024"}
                listingAddress={"1 Listing Address St, San Francisco CA, 94102"}
                listingName={"Submitted, view results"}
                listingURL={"/listing/abcd1234/listing-name"}
                lotteryComplete
                lotteryError={false}
                submitted
              />
              {/* Component if application is not submitted and is past due */}
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"#12345678"}
                editedDate={"June 1, 2024"}
                listingAddress={"1 Listing Address St, San Francisco CA, 94102"}
                listingName={"Not submitted, past due"}
                listingURL={"/listing/abcd1234/listing-name"}
                lotteryComplete={false}
                submitted={false}
                pastDue
              />
              {/* Component if application is not submitted and is not past due */}
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"#12345678"}
                editedDate={"June 1, 2024"}
                listingAddress={"1 Listing Address St, San Francisco CA, 94102"}
                listingName={"Not submitted, not past due"}
                listingURL={"/listing/abcd1234/listing-name"}
                lotteryComplete={false}
                submitted={false}
                pastDue={false}
              />
              {/* Component if no applications */}
              {noApplications()}
            </Card>
          </div>
        </section>
      }
    />
  )
}

export default withAppSetup(MyApplications)
