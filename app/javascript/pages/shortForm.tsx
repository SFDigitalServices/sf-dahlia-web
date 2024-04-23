import React, { useState } from "react"
import withAppSetup from "../layouts/withAppSetup"
import { Form } from "@formio/react"

function getFirstName() {
  return "Prefilled First Name"
}

const ShortForm = () => {
  const [state, setState] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const form = {
    title: "Example Pre-Filled Form",
    display: "form",
    components: [
      {
        label: "Your Name",
        disableSortingAndFiltering: false,
        tableView: true,
        key: "firstName",
        type: "textfield",
        input: true,
      },
      {
        label: "Submit",
        key: "submit",
        type: "button",
        action: "submit",
      },
    ],
  }

  const onSubmitHandler = (submission) => {
    setState({ firstName: submission.data.firstName })
    setSubmitted(true)
  }

  const submission = {
    data: {
      firstName: getFirstName(),
    },
  }

  return (
    <>
      {!submitted ? (
        <div className="px-10 py-10">
          <Form form={form} submission={submission} onSubmit={onSubmitHandler} />
        </div>
      ) : (
        <p className="px-10 py-10">
          First Name: <span>{state.firstName}</span>
        </p>
      )}
    </>
  )
}

export default withAppSetup(ShortForm)
