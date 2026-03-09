import React, { useContext, useState } from "react"
import { useDropzone, type FileWithPath } from "react-dropzone"
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
  proofFileName: string
  proofFileUploadedAt: string
}

const PreferenceProofUploadField = ({
  sessionId,
  listingId,
  listingPreferenceId,
  proofTypeFieldName,
  proofTypeLabel,
  proofTypeNote,
  proofTypeOptions,
  proofFileName,
  proofFileUploadedAt,
}: PreferenceProofUploadFieldProps) => {
  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, setValue, errors } = useFormContext()
  const { getAssetPath } = useContext(ConfigContext)

  const [uploadStatus, setUploadStatus] = useState<null | "loading" | "done" | "error">(null)
  const [uploadErrorMessage, setUploadErrorMessage] = useState("")

  const documentType: string = watch(proofTypeFieldName)
  const fileName: string = watch(proofFileName)
  const fileUploadedAt: string = watch(proofFileUploadedAt)

  const onDrop = (acceptedFiles, rejectedFiles) => {
    const rejectedFile = rejectedFiles[0]
    const acceptedFile: FileWithPath = acceptedFiles[0]

    if (rejectedFile) {
      console.error("file error:", rejectedFile.errors)
      setUploadErrorMessage(t("error.fileUpload"))
      setUploadStatus("error")
      return
    }

    const acceptedFileName = acceptedFile.path.slice(
      Math.max(0, acceptedFile.path.lastIndexOf("/") + 1)
    )
    if (acceptedFileName.length > 80) {
      setUploadErrorMessage(t("error.fileNameTooLong"))
      setUploadStatus("error")
      return
    }

    setUploadStatus("loading")
    uploadProofFile(sessionId, listingId, listingPreferenceId, documentType, acceptedFile)
      .then((data) => {
        if (!data.success) throw new Error("Upload failed")
        setUploadStatus("done")
        setValue(proofFileName, data.name)
        setValue(proofFileUploadedAt, data.created_at)
      })
      .catch((error) => {
        console.error("file upload error:", error)
        setUploadErrorMessage(t("error.fileUploadFailed"))
        setUploadStatus("error")
      })
  }

  const handleDeleteFile = () => {
    setUploadStatus("loading")
    deleteUploadedProofFile(sessionId, listingId, listingPreferenceId, documentType)
      .then(() => {
        setUploadStatus(null)
        setValue(proofFileName, null)
        setValue(proofFileUploadedAt, null)
      })
      .catch((error) => {
        console.error("file delete error:", error)
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
      <div style={fileName ? { display: "none" } : {}}>
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
      {/* use hidden fields to register form data, but manually update them with setValue()  */}
      <Field name={proofFileName} register={register} hidden />
      <Field name={proofFileUploadedAt} register={register} hidden />
      {uploadStatus === "loading" && <Icon symbol="spinner" size="large" />}
      {fileName && (
        <Card className={styles["uploaded-file"]}>
          <img src={getAssetPath("image_file.png")} alt="Uploaded File" />
          <div>
            <p>{documentType}</p>
            <p>{fileName}</p>
            <p>
              {t("label.uploaded")}: {localizedFormat(fileUploadedAt, "MMMM D")}
            </p>
          </div>
          <button onClick={handleDeleteFile}>{t("t.delete")}</button>
        </Card>
      )}
    </>
  )
}

export default PreferenceProofUploadField
