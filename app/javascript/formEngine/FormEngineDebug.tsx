import React, { useState } from "react"
import { type StepInfoSchema } from "./formSchemas"
import { type DataSources } from "./formEngineContext"
import "./FormEngineDebug.scss"

interface FormEngineDebugProps {
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  setCurrentStepIndex: (step: number) => void
  dataSources: DataSources
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
            <button className="dbg-other-step" onClick={() => setCurrentStepIndex(idx)}>
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
  dataSources,
}: FormEngineDebugProps) => {
  const [showSteps, setShowSteps] = useState(false)
  const [showStepInfo, setShowStepInfo] = useState(false)
  const [showListingData, setShowListingData] = useState(false)
  const [showFormData, setShowFormData] = useState(false)
  const [showPrefData, setShowPrefData] = useState(false)

  return (
    <div id="form-engine-debug">
      <div>
        <div>
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
          {showFormData && <ViewJson data={dataSources.form} />}
        </div>
      </div>
      <div>
        <div>
          <button onClick={() => setShowListingData(!showListingData)}>
            {showListingData ? "hide" : "show"} listing data
          </button>
          {showListingData && <ViewJson data={dataSources.listing} />}
        </div>
        <div>
          <button onClick={() => setShowPrefData(!showPrefData)}>
            {showPrefData ? "hide" : "show"} prefs data
          </button>
          {showPrefData && <ViewJson data={dataSources.preferences} />}
        </div>
      </div>
    </div>
  )
}

export default FormEngineDebug
