import React, { useState } from "react"
import { type StepInfoSchema } from "./formSchemas"
import "./FormEngineDebug.scss"
import { updateFormPath } from "../util/formEngineUtil"
import { getCurrentLanguage, LanguagePrefix } from "../util/languageUtil"

interface FormEngineDebugProps {
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  setCurrentStepIndex: (step: number) => void
  staticData: Record<string, unknown>
  formData: Record<string, unknown>
}

// Builds a link to the equivalent listing in the legacy Angular short-form
// application ("apply-welcome" flow), so devs can quickly compare behavior
// against the old form while debugging the new react form engine. The
// Angular flow is served by the same Rails app (via the catch-all
// angular#index route) on every environment - prod, full/staging, and PR
// review apps alike - so this just swaps the path on the current origin
// rather than pointing at a fixed host.
const getAngularFormUrl = (staticData: Record<string, unknown>): string => {
  const listing = staticData.listing as { listingID?: string } | undefined
  const lang = getCurrentLanguage(window.location.pathname)
  const langPrefix = lang && lang !== LanguagePrefix.English ? `/${lang}` : ""
  return `${window.location.origin}${langPrefix}/listings/${listing?.listingID ?? ""}/apply-welcome/intro`
}

const Steps = ({
  stepInfoMap,
  currentStepIndex,
  setCurrentStepIndex,
}: {
  stepInfoMap: StepInfoSchema[]
  currentStepIndex: number
  setCurrentStepIndex: (step: number) => void
}) => (
  <div className="dbg-steps">
    <ul>
      {stepInfoMap.map((stepInfo, idx) => (
        <li key={stepInfo.slug}>
          {idx === currentStepIndex ? (
            <span className="dbg-current-step">{stepInfo.slug}</span>
          ) : (
            <button
              className="dbg-other-step"
              onClick={() => {
                setCurrentStepIndex(idx)
                updateFormPath(idx, stepInfoMap)
              }}
            >
              {stepInfo.slug}
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ViewJson = ({ data }: { data: any }) => (
  <div className="dbg-view-json">
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
)

const FormEngineDebug = ({
  currentStepIndex,
  stepInfoMap,
  setCurrentStepIndex,
  staticData,
  formData,
}: FormEngineDebugProps) => {
  const [showSteps, setShowSteps] = useState(false)
  const [showStepInfo, setShowStepInfo] = useState(false)
  const [showListingData, setShowListingData] = useState(false)
  const [showFormData, setShowFormData] = useState(false)
  const [showPrefNameData, setShowPrefNameData] = useState(false)
  const [showPrefData, setShowPrefData] = useState(false)

  return (
    <div id="form-engine-debug">
      <div>
        <div className="dbg-steps-wrapper">
          <button onClick={() => setShowSteps(!showSteps)}>
            {showSteps ? "hide" : "show"} steps
          </button>
          {showSteps && <Steps {...{ stepInfoMap, currentStepIndex, setCurrentStepIndex }} />}
        </div>
        <div>
          <button onClick={() => setShowStepInfo(!showStepInfo)}>
            {showStepInfo ? "hide" : "show"} step info
          </button>
          {showStepInfo && <ViewJson data={stepInfoMap[currentStepIndex]} />}
        </div>
        <div>
          <button onClick={() => (window.location.href = getAngularFormUrl(staticData))}>
            angular form
          </button>
        </div>
      </div>
      <div>
        <div>
          <button onClick={() => setShowFormData(!showFormData)}>
            {showFormData ? "hide" : "show"} form data
          </button>
          {showFormData && <ViewJson data={formData} />}
        </div>
      </div>
      <div>
        <div>
          <button onClick={() => setShowListingData(!showListingData)}>
            {showListingData ? "hide" : "show"} listing data
          </button>
          {showListingData && <ViewJson data={staticData.listing} />}
        </div>
        <div>
          <button onClick={() => setShowPrefNameData(!showPrefNameData)}>
            {showPrefNameData ? "hide" : "show"} pref names data
          </button>
          {showPrefNameData && <ViewJson data={staticData.preferenceNames} />}
        </div>
        <div>
          <button onClick={() => setShowPrefData(!showPrefData)}>
            {showPrefData ? "hide" : "show"} prefs data
          </button>
          {showPrefData && <ViewJson data={staticData.preferences} />}
        </div>
      </div>
    </div>
  )
}

export default FormEngineDebug
