import React, { useState } from "react"
import { type StepInfoSchema } from "./formSchemas"
import "./FormEngineDebug.scss"
import { updateFormPath } from "../util/formEngineUtil"

interface FormEngineDebugProps {
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  setCurrentStepIndex: (step: number) => void
  staticData: Record<string, unknown>
  formData: Record<string, unknown>
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
