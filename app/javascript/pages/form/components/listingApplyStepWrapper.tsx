import React from "react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface ListingApplyStepWrapperProps {
  title: string
  description?: string
  descriptionComponent?: React.ReactNode
  children: React.ReactNode
}

const ListingApplyStepWrapper = ({ title, description, descriptionComponent, children }: ListingApplyStepWrapperProps) => {

  return (
      <Card className="w-full mobile-card">
        <Card.Header divider="flush" className="">
          <h1 className="mt-6 mb-4 text-xl md:text-2xl">{t(title)}</h1>
          <p className="field-note text-base">{t(description)}</p>
          {description &&
            <p className="field-note text-base">{description}</p>
          }
          {!!descriptionComponent && descriptionComponent}
        </Card.Header>
        <Form>
          {children}
        </Form>
      </Card>
  )
}

export default ListingApplyStepWrapper
