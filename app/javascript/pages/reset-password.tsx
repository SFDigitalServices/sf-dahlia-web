import React from "react"

import { AppearanceStyleType, Button, Form, FormCard, Icon, t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Link } from "@bloom-housing/ui-seeds"
import FormLayout from "../layouts/FormLayout"
import { getMyApplicationsPath, getSignInPath } from "../util/routeUtil"
import { useForm } from "react-hook-form"
import PasswordFieldset from "./account/components/PasswordFieldset"

interface ResetPasswordProps {
  assetPaths: unknown
}

const onSubmit = (data: { email: string }) => {
  // TODO: DAH-2987 API integration
  console.log(data)
  window.location.href = getMyApplicationsPath()
}

const ResetPassword = (_props: ResetPasswordProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()
  return (
    <FormLayout>
      <FormCard>
        <div className="form-card__lead text-center border-b mx-0">
          <Icon size="2xl" symbol="profile" />
          <h2 className="form-card__title">{t("pageTitle.resetPassword.lowercase")}</h2>
        </div>
        <div className="form-card__group pt-0 border-b">
          <Form className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
            <PasswordFieldset
              register={register}
              errors={errors}
              watch={watch}
              labelText={t("label.chooseNewPassword")}
              passwordType="resetPassword"
            />
            <div className="text-center mt-4">
              <Button styleType={AppearanceStyleType.primary} type="submit">
                {t("resetPassword.updatePassword")}
              </Button>
            </div>
            <div className="text-center mt-4">
              <Link href={getSignInPath()}>{t("label.cancel")}</Link>
            </div>
          </Form>
        </div>
      </FormCard>
    </FormLayout>
  )
}

export default withAppSetup(ResetPassword, true)
