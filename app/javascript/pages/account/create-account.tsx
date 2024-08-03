/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"

import {
  AppearanceStyleType,
  Button,
  Field,
  Form,
  passwordRegex,
  t,
} from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import NameFieldset from "./components/NameFieldset"
import { useForm } from "react-hook-form"
import DOBFieldset from "./components/DOBFieldset"
import EmailFieldset from "./components/EmailFieldset"
import { NewPasswordInstructions } from "./components/PasswordFieldset"
import { FormHeader } from "../../util/accountUtil"

interface CreateAccountProps {
  assetPaths: unknown
}

const MOBILE_SIZE = 768

const FormSection = ({ children }: { children: React.ReactNode }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card.Section divider={windowWidth > MOBILE_SIZE ? "inset" : "flush"}>{children}</Card.Section>
  )
}

const NameSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <FormSection>
      <NameFieldset
        register={register}
        errors={errors}
        defaultFirstName={null}
        defaultMiddleName={null}
        defaultLastName={null}
      />
    </FormSection>
  )
}

const DateOfBirthSection = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({ mode: "all" })

  return (
    <FormSection>
      <DOBFieldset
        required
        defaultDOB={null}
        register={register}
        error={errors.dob}
        watch={watch}
      />
    </FormSection>
  )
}

const EmailSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <FormSection>
      <EmailFieldset register={register} errors={errors} defaultEmail={null} />
    </FormSection>
  )
}

const PasswordSection = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })

  return (
    <FormSection>
      <div>
        <label htmlFor="password">{t("label.choosePassword")}</label>
      </div>
      <div className="field-note my-2">
        <NewPasswordInstructions />
      </div>
      {/* Todo: DAH-2387 Adaptive password validation */}
      <Field
        type="password"
        name="password"
        className="mt-0 mb-4"
        validation={{
          minLength: 8,
          pattern: passwordRegex,
        }}
        error={errors.password}
        errorMessage={t("error.password")}
        register={register}
      />
      <div className="flex justify-center pt-4">
        <Button styleType={AppearanceStyleType.primary} type="submit">
          {t("label.createAccount")}
        </Button>
      </div>
    </FormSection>
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
            <Form className="p-2 md:py-2 md:px-10" onSubmit={onSubmit}>
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
