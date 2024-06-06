import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { t, Icon } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { ApplicationItem } from "../../components/ApplicationItem"

const MyApplications = () => {
  const noApplications = () => {
    return (
      <Card.Section>
        <Heading priority={2} size="md">
          {t("myApplications.noApplications")}
        </Heading>
        <Button size="sm" variant="primary-outlined" href="/listings">
          {t("listings.browseRentals")}
        </Button>
        <Button size="sm" variant="primary-outlined" href="/listings">
          {t("listings.browseSales")}
        </Button>
      </Card.Section>
    )
  }

  return (
    <Layout
      children={
        <section className="bg-gray-300 border-t border-gray-450">
          <div className="flex flex-wrap relative max-w-3xl mx-auto sm:p-8">
            <Card>
              <Card.Header className="flex justify-center w-full flex-col items-center">
                <div
                  className="pb-4 border-blue-500 w-min px-4 md:px-8 mb-6"
                  style={{ borderBottom: "3px solid" }}
                >
                  <Icon size="xlarge" className="md:hidden block" symbol={"application"} />
                  <Icon size="2xl" className="md:block hidden" symbol={"application"} />
                </div>
                <Heading priority={1} size="2xl">
                  {t("myApplications.title")}
                </Heading>
              </Card.Header>
              <ApplicationItem
                applicationDueDate={"June 1, 2024"}
                applicationURL={"application/1234abcd"}
                applicationUpdatedAt={"March 8th, 2022"}
                confirmationNumber={"1234abcd"}
                listingName={"Listing Name"}
                listingURL={"/listing/abcd1234/listing-name"}
              />
              {/* Show only if no applications */}
              {noApplications()}
            </Card>
          </div>
        </section>
      }
    />
  )
}

export default withAppSetup(MyApplications)
