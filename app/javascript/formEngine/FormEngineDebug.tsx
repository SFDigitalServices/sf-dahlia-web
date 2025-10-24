import React, { useState } from "react"
import {
  type StepInfoSchema,
} from "./formSchemas"
import { type DataSources } from "./formEngineContext"
import "./FormEngineDebug.scss"

interface FormEngineDebugProps {
  currentStepIndex: number
  stepInfoMap: StepInfoSchema[]
  setCurrentStepIndex: (step: number) => void
  dataSources: DataSources
}

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

  const CurrentStep = ({ slug }: { slug: string }) => (
    <span className="dbg-current-step">{slug}</span>
  )

  const OtherStep = ({ slug, idx }: { slug: string; idx: number }) => (
    <a className="dbg-other-step" onClick={() => setCurrentStepIndex(idx)}>
      {slug}
    </a>
  )

  const Steps = () => (
    <div className="dbg-steps">
      <ul>
        {stepInfoMap.map((stepInfo, idx) => (
          <li>
            {idx === currentStepIndex ? (
              <CurrentStep slug={stepInfo.slug} />
            ) : (
              <OtherStep slug={stepInfo.slug} idx={idx} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )

  const ViewJson = ({ data }: { data: any }) => (
    <div className="dbg-view-json">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )

  return (
    <div id="form-engine-debug">
      <div>
        <div>
          <button onClick={() => setShowSteps(!showSteps)}>
            {showSteps ? "hide" : "show"} steps
          </button>
          {showSteps && <Steps />}
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
