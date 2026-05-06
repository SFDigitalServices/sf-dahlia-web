import React, { useState } from "react"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import {
  t,
  Icon,
  Button,
  AppearanceStyleType,
  AppearanceBorderType,
} from "@bloom-housing/ui-components"
import { Card, Dialog, Heading } from "@bloom-housing/ui-seeds"
import {
  AppPages,
  RedirectType,
} from "../../util/routeUtil"
import { deleteApplication, getApplications } from "../../api/authApiService"
import { Application } from "../../api/types/rails/application/RailsApplication"
import "./styles/my-applications.scss"
import { DoubleSubmittedModal } from "./components/DoubleSubmittedModal"
import { AlreadySubmittedModal } from "./components/AlreadySubmittedModal"
import { extractModalParamsFromUrl } from "./components/util"
import { withAuthentication } from "../../authentication/withAuthentication"
import { determineApplicationItemList } from "./my-applications"

const AccountApplications = () => {
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [applications, setApplications] = React.useState<Application[]>([])
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
  const [alreadySubmittedId, setAlreadySubmittedId] = useState<string | null>(null)
  const [openDoubleSubmittedModal, setOpenDoubleSubmittedModal] = useState<boolean>(false)
  const [deleteApp, setDeleteApp] = useState("")

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
        setError(error)
      })
      .finally(() => {
        setLoading(false)
      })
    setOpenDeleteModal(false)
  }

  React.useEffect(() => {
    const { alreadySubmittedIdFromURL, doubleSubmitFromURL } = extractModalParamsFromUrl(
      window.location.href
    )

    if (alreadySubmittedIdFromURL) {
      setAlreadySubmittedId(alreadySubmittedIdFromURL)
    }

    if (doubleSubmitFromURL) {
      setOpenDoubleSubmittedModal(true)
    }
  }, [])

  React.useEffect(() => {
    setLoading(true)
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
  }, [])

  return (
    <Layout>
      <AccountLayout>
        <div className="flex flex-wrap relative sm:py-8">
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
            <AlreadySubmittedModal
              alreadySubmittedId={alreadySubmittedId}
              alreadySubmittedApplication={
                applications && applications.find((item) => item.id === alreadySubmittedId)
              }
              onClose={() => {
                setAlreadySubmittedId(null)
              }}
            />
            <DoubleSubmittedModal
              openModal={openDoubleSubmittedModal}
              onClose={() => {
                setOpenDoubleSubmittedModal(false)
              }}
            />
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
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(
  withAuthentication(AccountApplications, { redirectType: RedirectType.Applications }),
  {
    pageName: AppPages.MyApplications,
  }
)
