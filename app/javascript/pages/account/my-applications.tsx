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

export const determineApplicationItemList = (
  loading: boolean,
  error: string,
  deleteError: string,
  applications: Application[],
  handleDeleteApp: (id: string) => void
) => {
  if (loading) {
    return (
      <div data-testid="loading-spinner" className="flex justify-center pb-9">
        <Icon symbol="spinner" size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="w-full text-center p-4">
        {renderInlineMarkup(`${t("listings.myApplications.error")}`)}
      </p>
    )
  }

  if (deleteError) {
    return (
      <p className="w-full text-center p-4">
        {renderInlineMarkup(`${t("error.alert.badRequest")}`)}
      </p>
    )
  }

  if (applications === undefined || applications.length === 0) {
    return noApplications()
  }

  const rentalApplications = applications
    .filter((app) => isRental(app.listing))
    .sort(
      (a, b) =>
        new Date(b.applicationSubmittedDate).getTime() -
        new Date(a.applicationSubmittedDate).getTime()
    )

  const saleApplications = applications
    .filter((app) => isSale(app.listing))
    .sort(
      (a, b) =>
        new Date(b.applicationSubmittedDate).getTime() -
        new Date(a.applicationSubmittedDate).getTime()
    )

  const hasBothRentalAndSaleApplications =
    rentalApplications.length > 0 && saleApplications.length > 0

  return (
    <>
      {hasBothRentalAndSaleApplications && (
        <Heading className="text-xl border-t border-gray-450 px-4 py-4" priority={2}>
          {t("listings.rentalUnits")}
        </Heading>
      )}
      {rentalApplications.map((app) => (
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
      ))}
      {hasBothRentalAndSaleApplications && (
        <Heading className="text-xl border-t border-gray-450 px-4 py-4" priority={2}>
          {t("listings.saleUnits")}
        </Heading>
      )}
      {saleApplications.map((app) => (
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
      ))}
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
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const handleDeleteApp = (id: string) => {
    setDeleteApp(id)
    setOpenDeleteModal(true)
  }

  const onDelete = () => {
    setLoading(true)
    deleteApplication(deleteApp)
      .then(() => {
        const newApplications = applications.filter((application) => application.id !== deleteApp)
        setApplications(newApplications)
      })
      .catch((error: string) => {
        setDeleteError(error)
      })
      .finally(() => {
        setLoading(false)
      })
    setOpenDeleteModal(false)
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
              {determineApplicationItemList(
                loading,
                error,
                deleteError,
                applications,
                handleDeleteApp
              )}
            </Card>
          </div>
        </section>
      }
    />
  )
}

export default withAppSetup(MyApplications)
