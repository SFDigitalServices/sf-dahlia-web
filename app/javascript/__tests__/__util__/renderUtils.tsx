/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, render, RenderOptions, RenderResult } from "@testing-library/react"
import React from "react"
import crypto from "crypto"
import { useForm, FormProvider } from "react-hook-form"
import { FormEngineProvider } from "../../formEngine/formEngineContext"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"
import { FormStepProvider } from "../../formEngine/formStepContext"

export const mockWindowLocation = (): typeof window.location => {
  const originalLocation = { ...window.location }
  delete (window as any).location
  window.location = {
    ...originalLocation,
    assign: jest.fn(),
  } as any
  return originalLocation
}

export const restoreWindowLocation = (originalLocation: typeof window.location): void => {
  Object.defineProperty(window, "location", {
    value: originalLocation,
    writable: true,
  })
}

/**
 * Render the component and wait for its async calls to complete.
 *
 * This is useful when a component loads in data with a useEffect()
 * hook.
 */
export const renderAndLoadAsync = async (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">
): Promise<RenderResult> => {
  let renderResponse: RenderResult = {} as RenderResult
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    renderResponse = render(ui, options)
  })

  return renderResponse
}

// defines crypto methods for test environment
export const defineCryptoApi = () => {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => crypto.randomUUID(),
    },
  })
}

// Wrapper for application form component tests
export const formContextWrapper = (
  formComponent: React.ReactElement
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const formMethods = useForm({
      mode: "onBlur",
      reValidateMode: "onBlur",
      shouldFocusError: false,
      defaultValues: {},
    })
    return (
      <FormStepProvider value={formMethods}>
        <FormEngineProvider
          value={{
            listing: openRentalListing,
            formData: {},
            saveFormData: jest.fn(),
            dataSources: {
              listing: openRentalListing,
              form: {},
              preferences: {},
            },
            stepInfoMap: [{ slug: "test", fieldNames: [] }],
            sectionNames: [],
            currentStepIndex: 0,
            handleNextStep: jest.fn(),
            handlePrevStep: jest.fn(),
          }}
        >
          <FormProvider {...formMethods}>{children}</FormProvider>
        </FormEngineProvider>
      </FormStepProvider>
    )
  }
  return render(formComponent, { wrapper: Wrapper })
}
