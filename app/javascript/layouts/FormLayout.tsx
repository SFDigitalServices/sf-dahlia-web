import React from "react"

import Layout from "./Layout"

export interface FormLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  image?: string
}

const FormLayout = (props: FormLayoutProps) => (
  <Layout title={props.title} image={props.image} description={props.description}>
    <section className="bg-gray-300">{props.children}</section>
  </Layout>
)

export default FormLayout
