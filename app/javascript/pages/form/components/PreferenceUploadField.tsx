import React, { useContext, useState } from "react"
import { useDropzone } from "react-dropzone"
import { localizedFormat, renderInlineMarkup } from "../../../util/languageUtil"
import { t, Field, Select, Icon } from "@bloom-housing/ui-components"
import { Card, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { ConfigContext } from "../../../lib/ConfigContext"
import { useFormContext } from "react-hook-form"
import { uploadProofFile, deleteUploadedProofFile } from "../../../api/formApiService"
import styles from "./PreferenceUploadField.module.scss"

interface PreferenceProofUploadFieldProps {
  sessionId: string
  listingId: string
  listingPreferenceId: string
  proofTypeFieldName: string
  proofTypeLabel: string
  proofTypeNote: string
  proofTypeOptions: { label: string; value: string }[]
  proofDocFieldName: string
}

const PreferenceProofUploadField = ({
  sessionId,
  listingId,
  listingPreferenceId,
  proofTypeFieldName,
  proofTypeLabel,
  proofTypeNote,
  proofTypeOptions,
  proofDocFieldName,
}: PreferenceProofUploadFieldProps) => {
  const { register, watch, setValue, errors } = useFormContext()
  const { getAssetPath } = useContext(ConfigContext)

  const [uploadStatus, setUploadStatus] = useState<null | "loading" | "done" | "error">(null)
  const [uploadErrorMessage, setUploadErrorMessage] = useState("")
  const [fileName, setFileName] = useState("")
  const [uploadTime, setUploadTime] = useState("")

  const documentType: string = watch(proofTypeFieldName)

  const onDrop = (acceptedFiles, rejectedFiles) => {
    const rejectedFile = rejectedFiles[0]
    const acceptedFile = acceptedFiles[0]

    if (rejectedFile) {
      console.error("file error: ", rejectedFile.errors)
      setUploadErrorMessage(t("error.fileUpload"))
      return
    }

    const fileName = acceptedFile.path.substring(acceptedFile.path.lastIndexOf("/") + 1)
    if (fileName.length > 80) {
      setUploadErrorMessage(t("error.fileNameTooLong"))
      return
    }

    setUploadStatus("loading")
    uploadProofFile(sessionId, listingId, listingPreferenceId, documentType, acceptedFile)
      .then((data) => {
        if (!data.success) throw new Error("Upload failed")
        setUploadStatus("done")
        setFileName(data.name)
        setUploadTime(localizedFormat(data.created_at, "MMMM D"))
      })
      .catch((error) => {
        console.error("file upload error: ", error)
        setUploadErrorMessage(t("error.fileUploadFailed"))
        setUploadStatus("error")
      })
  }

  const handleDeleteFile = () => {
    setUploadStatus("loading")
    deleteUploadedProofFile(sessionId, listingId, listingPreferenceId, documentType)
      .then(() => {
        setUploadStatus(null)
      })
      .catch((error) => {
        console.error("file delete error: ", error)
        setUploadErrorMessage(t("error.fileUploadFailed"))
        setUploadStatus("error")
      })
  }

  const translatedProofOptions = proofTypeOptions.map((option) => ({
    ...option,
    label: t(option.label),
  }))

  const { getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".heic"],
      "application/pdf": [".pdf"],
    },
    maxSize: 6_000_000, // about 5 megabytes
    multiple: false,
  })

  return (
    <>
      <div style={uploadStatus === "done" ? { display: "none" } : {}}>
        <Select
          id={proofTypeFieldName}
          name={proofTypeFieldName}
          label={proofTypeLabel}
          subNote={proofTypeNote}
          options={translatedProofOptions}
          placeholder={t("label.selectOne")}
          controlClassName="control"
          register={register}
          error={!!errors?.[proofTypeFieldName]}
          errorMessage={t("error.pleaseSelectAnOption")}
          validation={{
            required: true,
          }}
        />
        <Button onClick={open} disabled={!documentType} className={styles["upload-button"]}>
          {t("label.uploadProofOfPreference")}
        </Button>
        {uploadStatus === "error" && (
          <p className={styles["upload-error"]}>
            <FormErrorMessage>{uploadErrorMessage}</FormErrorMessage>
          </p>
        )}
        <div className={styles["upload-notes"]}>
          <p className={styles["smartphone-note"]}>{t("label.uploadProofInstructions1")}</p>
          <p>{renderInlineMarkup(t("label.uploadProofInstructions2"))}</p>
          <p>{t("label.uploadProofInstructions3")}</p>
        </div>
      </div>
      <input {...getInputProps()} />
      <Field name={proofDocFieldName} register={register} hidden />

      {uploadStatus === "loading" && <Icon symbol="spinner" size="large" />}
      {uploadStatus === "done" && (
        <Card className={styles["uploaded-file"]}>
          <img src={getAssetPath("image_file.png")} alt="Uploaded File" />
          <div>
            <p>{documentType}</p>
            <p>{fileName}</p>
            <p>
              {t("label.uploaded")}: {uploadTime}
            </p>
          </div>
          <button onClick={handleDeleteFile}>{t("t.delete")}</button>
        </Card>
      )}
    </>
  )
}

export default PreferenceProofUploadField
