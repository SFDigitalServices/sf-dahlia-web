import React, { useState } from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import {
  t,
  Icon,
  LinkButton,
  Button,
  AppearanceStyleType,
  AppearanceBorderType,
} from "@bloom-housing/ui-components"
import { Card, Dialog, Heading } from "@bloom-housing/ui-seeds"
import { ApplicationItem } from "../../components/ApplicationItem"
import { getApplicationPath, getLocalizedPath, getSignInPath } from "../../util/routeUtil"
import { getCurrentLanguage, renderInlineMarkup } from "../../util/languageUtil"
import { deleteApplication, getApplications } from "../../api/authApiService"
import UserContext from "../../authentication/context/UserContext"
import { Application } from "../../api/types/rails/application/RailsApplication"
import { isRental, isSale } from "../../util/listingUtil"
import "./my-applications.scss"

export const noApplications = () => {
  return (
    <Card.Section className="flex flex-col bg-primary-lighter items-center pb-12 border-t">
      <h2 className="text-xl">{t("myApplications.noApplications")}</h2>
      <div className="flex flex-col gap-y-4 w-3/5 pt-4">
        <LinkButton href={getLocalizedPath("/listings/for-rent", getCurrentLanguage())}>
          {t("listings.browseRentals")}
        </LinkButton>
        <LinkButton href={getLocalizedPath("/listings/for-sale", getCurrentLanguage())}>
          {t("listings.browseSales")}
        </LinkButton>
      </div>
    </Card.Section>
  )
}

const loadingSpinner = () => {
  return (
    <div data-testid="loading-spinner" className="flex justify-center pb-9">
      <Icon symbol="spinner" size="large" />
    </div>
  )
}

const errorMessage = () => {
  return (
    <p className="w-full text-center p-4">
      {renderInlineMarkup(`${t("listings.myApplications.error")}`)}
    </p>
  )
}

const applicationHeader = (text: string) => {
  return (
    <Heading className="text-xl border-t border-gray-450 px-4 py-4" priority={2}>
      {text}
    </Heading>
  )
}

const generateApplicationList = (
  applications: Application[],
  handleDeleteApp: (id: string) => void
) => {
  return applications
    .sort(
      (a, b) =>
        new Date(b.applicationSubmittedDate).getTime() -
        new Date(a.applicationSubmittedDate).getTime()
    )
    .map((app) => (
      <ApplicationItem
        applicationURL={`${getApplicationPath()}/${app.id}`}
        applicationUpdatedAt={app.applicationSubmittedDate}
        confirmationNumber={app.lotteryNumber.toString()}
        editedDate={app.applicationSubmittedDate}
        submitted={app.status === "Submitted"}
        listing={app.listing}
        key={app.id}
        handleDeleteApp={handleDeleteApp}
      />
    ))
}

const separateApplications = (applications: Application[]) =>
  applications.reduce<{
    rentalApplications: Application[]
    saleApplications: Application[]
  }>(
    (acc, app) => {
      if (isRental(app.listing)) {
        acc.rentalApplications.push(app)
      } else if (isSale(app.listing)) {
        acc.saleApplications.push(app)
      }

      return acc
    },
    { rentalApplications: [], saleApplications: [] }
  )

export const determineApplicationItemList = (
  loading: boolean,
  error: string,
  applications: Application[],
  handleDeleteApp: (id: string) => void
) => {
  if (loading) {
    return loadingSpinner()
  }

  if (error) {
    return errorMessage()
  }

  if (applications === undefined || applications.length === 0) {
    return noApplications()
  }

  const { rentalApplications, saleApplications } = separateApplications(applications)

  const hasBothRentalAndSaleApplications =
    rentalApplications.length > 0 && saleApplications.length > 0

  return (
    <>
      {hasBothRentalAndSaleApplications && applicationHeader(t("listings.rentalUnits"))}
      {generateApplicationList(rentalApplications, handleDeleteApp)}
      {hasBothRentalAndSaleApplications && applicationHeader(t("listings.saleUnits"))}
      {generateApplicationList(saleApplications, handleDeleteApp)}
    </>
  )
}

const MyApplications = () => {
  const { profile, loading: authLoading, initialStateLoaded } = React.useContext(UserContext)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [applications, setApplications] = React.useState<Application[]>([])
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
  const [deleteApp, setDeleteApp] = useState("")

  const handleDeleteApp = (id: string) => {
    setDeleteApp(id)
    setOpenDeleteModal(true)
  }

  React.useEffect(() => {
    setLoading(true)
    if (profile) {
      getApplications()
        .then((applications) => {
          setApplications(applications.applications)
        })
        .catch((error: string) => {
          setError(error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [authLoading, initialStateLoaded, profile])

  const onDelete = () => {
    setLoading(true)
    deleteApplication(deleteApp)
      .then(() => {
        const newApplications = applications.filter((application) => application.id !== deleteApp)
        setApplications(newApplications)
      })
      .catch((error: string) => {
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })
    setOpenDeleteModal(false)
  }

  if (!profile && !authLoading && initialStateLoaded) {
    // TODO: Redirect to React sign in page and show a message that user needs to sign in
    window.location.href = getSignInPath()
    return null
  }

  return (
    <Layout
      children={
        <section className="bg-gray-300 border-t border-gray-450">
          <div className="flex flex-wrap relative max-w-2xl mx-auto sm:py-8">
            <Card className="w-full mobile-card">
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
              <Dialog
                isOpen={openDeleteModal}
                onClose={() => {
                  setOpenDeleteModal(false)
                }}
                className="w-3/5"
              >
                <Dialog.Header>
                  <div className="delete-title">{t("t.deleteApplication")}</div>
                </Dialog.Header>
                <Dialog.Content>{t("myApplications.areYouSureYouWantToDelete")}</Dialog.Content>
                <Dialog.Footer className="delete-buttons">
                  <Button styleType={AppearanceStyleType.alert} onClick={onDelete}>
                    {t("t.delete")}
                  </Button>
                  <Button
                    className={AppearanceBorderType.borderless}
                    onClick={() => setOpenDeleteModal(false)}
                  >
                    {t("label.cancel")}
                  </Button>
                </Dialog.Footer>
              </Dialog>
              {determineApplicationItemList(loading, error, applications, handleDeleteApp)}
            </Card>
          </div>
        </section>
      }
    />
  )
}

export default withAppSetup(MyApplications)
