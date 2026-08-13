/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { act, render, RenderOptions, RenderResult } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import { MemoryRouter } from "react-router"
import crypto from "crypto"
import { useForm, FormProvider } from "react-hook-form"
import { FormEngineProvider } from "../../formEngine/formEngineContext"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"
import { type StepInfoSchema } from "../../formEngine/formSchemas"
import { type SectionInfo } from "../../formEngine/formEngine"

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
 *
 * By default the MemoryRouter starts at "/" - pass `initialEntries` to render
 * under a specific path (e.g. for components that parse an id out of the URL).
 */
export const renderAndLoadAsync = async (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">,
  initialEntries: string[] = ["/"]
): Promise<RenderResult> => {
  let renderResponse: RenderResult = {} as RenderResult
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    renderResponse = render(ui, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      ),
      ...options,
    }) as RenderResult
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
export const renderWithFormContextWrapper = (
  formComponent: React.ReactElement,
  {
    formData = {},
    staticData = {},
    stepInfoMap = [],
    sectionMap = [],
    renderForm = true,
  }: {
    formData?: Record<string, unknown>
    staticData?: Record<string, unknown>
    stepInfoMap?: StepInfoSchema[]
    sectionMap?: SectionInfo[]
    renderForm?: boolean
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
  } = {
    formData: {},
    staticData: {},
    stepInfoMap: [],
    sectionMap: [],
    renderForm: true,
  }
) => {
  const defaultStepInfoMap = [{ slug: "test-slug", fieldNames: [] }]
  const defaultSectionMap = [{ name: "shortFormNav.you", stepSlugs: ["test-slug"] }]

  const defaultStaticData = {
    listing: openRentalListing,
    form: {},
    preferences: [],
    preferenceNames: {},
  }

  const mockHandleNextStep = jest.fn()
  const mockHandlePrevStep = jest.fn()
  const mockJumpToStep = jest.fn()
  const mockSaveFormData = jest.fn()
  const mockHandleSetSectionCompletion = jest.fn()

  const formEngineContextValue = {
    sessionId: "test-session-id-1234",
    saveFormData: mockSaveFormData,
    formData: { ...formData },
    staticData: { ...defaultStaticData, ...staticData },
    stepInfoMap: [...stepInfoMap, ...defaultStepInfoMap],
    sectionMap: [...sectionMap, ...defaultSectionMap],
    completedSections: {},
    currentStepIndex: 0,
    handleNextStep: mockHandleNextStep,
    handlePrevStep: mockHandlePrevStep,
    handleSetSectionCompletion: mockHandleSetSectionCompletion,
    jumpToStep: mockJumpToStep,
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const formMethods = useForm({
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: false,
      defaultValues: {},
    })

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void formMethods.handleSubmit(jest.fn())(event)
    }

    return (
      <FormEngineProvider value={formEngineContextValue}>
        <FormProvider {...formMethods}>
          {renderForm ? (
            <form onSubmit={onSubmit}>
              {children}
              <button type="submit">{t("t.next")}</button>
            </form>
          ) : (
            children
          )}
        </FormProvider>
      </FormEngineProvider>
    )
  }
  render(formComponent, { wrapper: Wrapper })
  return {
    mockHandleNextStep,
    mockHandlePrevStep,
    mockJumpToStep,
    mockSaveFormData,
    mockHandleSetSectionCompletion,
  }
}
