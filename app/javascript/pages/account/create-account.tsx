/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"

import { AppearanceStyleType, Button, Form, t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import NameFieldset from "./components/NameFieldset"
import { useForm } from "react-hook-form"
import DOBFieldset from "./components/DOBFieldset"
import EmailFieldset from "./components/EmailFieldset"
import PasswordFieldset from "./components/PasswordFieldset"
import { FormHeader, FormSection } from "../../util/accountUtil"
import "./styles/account.scss"

interface CreateAccountProps {
  assetPaths: unknown
}

const CreateAccountFormSection = ({ children }: { children: React.ReactNode }) => {
  return <FormSection className="py-4 p-2 md:py-8 md:px-10">{children}</FormSection>
}

const NameSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <CreateAccountFormSection>
      <NameFieldset
        register={register}
        errors={errors}
        defaultFirstName={null}
        defaultMiddleName={null}
        defaultLastName={null}
      />
    </CreateAccountFormSection>
  )
}

const DOBNote = () => {
  return (
    <>
      <div className="pb-2">{t("createAccount.dobExample")}</div>
      <div>{t("createAccount.dobNote")}</div>
    </>
  )
}

const DateOfBirthSection = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({ mode: "all" })

  return (
    <CreateAccountFormSection>
      <DOBFieldset
        required
        defaultDOB={null}
        register={register}
        error={errors.dob}
        watch={watch}
        note={<DOBNote />}
      />
    </CreateAccountFormSection>
  )
}

const EmailSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <CreateAccountFormSection>
      <EmailFieldset
        register={register}
        errors={errors}
        defaultEmail={null}
        note={t("createAccount.emailNote")}
      />
    </CreateAccountFormSection>
  )
}

const PasswordSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <CreateAccountFormSection>
      <PasswordFieldset register={register} errors={errors} />
      <div className="flex justify-center pt-4">
        <Button styleType={AppearanceStyleType.primary} type="submit">
          {t("label.createAccount")}
        </Button>
      </div>
    </CreateAccountFormSection>
  )
}

const signInRedirect = () => {
  console.log("sign in ")
}

const CreateAccountFooter = () => {
  return (
    <Card.Section
      divider="flush"
      className="flex justify-center pt-8 text-center w-full flex-col items-center"
    >
      <div>{t("createAccount.alreadyHaveAccount")}</div>
      <Button className="uppercase" type="button" onClick={signInRedirect}>
        {t("label.signIn")}
      </Button>
    </Card.Section>
  )
}

const onSubmit = () => {
  console.log("hello")
}

const CreateAccount = (_props: CreateAccountProps) => {
  return (
    <Layout title={t("pageTitle.createAccount")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full pb-8">
            <FormHeader
              title={t("createAccount.title.sentenceCase")}
              description={t("createAccount.description")}
            />
            <Form onSubmit={onSubmit}>
              <NameSection />
              <DateOfBirthSection />
              <EmailSection />
              <PasswordSection />
              <CreateAccountFooter />
            </Form>
          </Card>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(CreateAccount, true)
