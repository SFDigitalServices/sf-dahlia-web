import React from "react"
import type { Meta, StoryObj } from "@storybook/react-webpack5"
import { useForm } from "react-hook-form"
import AlternateContactType from "../app/javascript/pages/form/components/AlternateContactType"
import { FormStepProvider } from "../app/javascript/formEngine/formStepContext"

// Wrapper to provide react-hook-form context
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, formState: { errors }, watch, trigger } = useForm({ mode: "onBlur" })
  return (
    <FormStepProvider value={{ register, errors, watch, trigger }}>
      <div style={{ maxWidth: 480, padding: 24 }}>{children}</div>
    </FormStepProvider>
  )
}

const meta = {
  title: "Form/AlternateContactType",
  component: AlternateContactType,
  decorators: [
    (Story) => (
      <FormWrapper>
        <Story />
      </FormWrapper>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof AlternateContactType>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    fieldNames: {
      alternateContactType: "alternateContactType",
      alternateContactTypeOther: "alternateContactTypeOther",
    },
  },
}
