import React, { useContext, useState } from "react"
import { useDropzone, type FileWithPath, type FileRejection } from "react-dropzone"
import { localizedFormat, renderInlineMarkup } from "../../../util/languageUtil"
import { t, Field, Select, Icon } from "@bloom-housing/ui-components"
import { Card, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { ConfigContext } from "../../../lib/ConfigContext"
import { useFormContext } from "react-hook-form"
import { uploadProofFile, deleteUploadedProofFile } from "../../../api/formApiService"
import { getNestedError } from "../../../util/formEngineUtil"
import styles from "./PreferenceProofUploadField.module.scss"

interface PreferenceProofUploadFieldProps {
  sessionId: string
  listingId: string
  listingPreferenceId: string
  proofTypeFieldName: string
  proofTypeSingleValue?: string
  proofTypeLabel: string
  proofTypeNote?: string
  proofTypeOptions?: { label: string; value: string }[]
  proofFileName: string
  proofFileUploadedAt: string
  proofUploadButtonLabel?: string
}

const PreferenceProofUploadField = ({
  sessionId,
  listingId,
  listingPreferenceId,
  proofTypeFieldName,
  proofTypeSingleValue,
  proofTypeLabel,
  proofTypeNote,
  proofTypeOptions,
  proofFileName,
  proofFileUploadedAt,
  proofUploadButtonLabel,
}: PreferenceProofUploadFieldProps) => {
  // https://github.com/react-hook-form/react-hook-form/issues/2887#issuecomment-802577357
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, watch, setValue, errors, clearErrors } = useFormContext()
  const { getAssetPath } = useContext(ConfigContext)

  const [uploadStatus, setUploadStatus] = useState<null | "loading" | "done" | "error">(null)
  const [uploadErrorMessage, setUploadErrorMessage] = useState("")

  const documentType: string = watch(proofTypeFieldName)
  const fileName: string = watch(proofFileName)
  const fileUploadedAt: string = watch(proofFileUploadedAt)

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    const rejectedFile = rejectedFiles[0]
    const acceptedFile: FileWithPath = acceptedFiles[0]

    if (rejectedFile) {
      console.error("file error:", rejectedFile.errors)
      setUploadErrorMessage(t("error.fileUpload"))
      setUploadStatus("error")
      return
    }

    if (!documentType || !acceptedFile) {
      setUploadErrorMessage(t("error.fileMissing"))
      setUploadStatus("error")
      return
    }

    if (acceptedFile.name.length > 80) {
      setUploadErrorMessage(t("error.fileNameTooLong"))
      setUploadStatus("error")
      return
    }

    setUploadStatus("loading")
    uploadProofFile(sessionId, listingId, listingPreferenceId, documentType, acceptedFile)
      .then((data) => {
        if (!data.success) throw new Error("Upload failed")
        setUploadStatus("done")
        clearErrors(proofFileName)
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

  const translatedProofOptions = proofTypeOptions?.map((option) => ({
    ...option,
    label: t(option.label),
  }))

  const { getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".heic"],
      "application/pdf": [".pdf"],
    },
    maxSize: 6_000_000, // about 6 megabytes (≈5.7 MiB)
    multiple: false,
  })

  return (
    <>
      <div className={fileName ? "hidden" : ""}>
        <div className={styles["upload-label"]}>{proofTypeLabel}</div>
        {proofTypeNote && <div className="field-note">{renderInlineMarkup(proofTypeNote)}</div>}
        {proofTypeFieldName &&
          proofTypeLabel &&
          translatedProofOptions &&
          !proofTypeSingleValue && (
            <Select
              id={proofTypeFieldName}
              name={proofTypeFieldName}
              options={translatedProofOptions}
              placeholder={t("label.selectOne")}
              controlClassName="control"
              register={register}
              error={!!getNestedError(errors, proofTypeFieldName)}
              errorMessage={t("error.pleaseSelectAnOption")}
              validation={{
                required: true,
              }}
            />
          )}
        {/* if proofTypeSingleValue prop is present, then the user cannot choose the proof type */}
        {proofTypeSingleValue && (
          <Field
            name={proofTypeFieldName}
            defaultValue={proofTypeSingleValue}
            register={register}
            hidden
          />
        )}
        <Button
          onClick={open}
          disabled={!documentType && !proofTypeSingleValue}
          variant={getNestedError(errors, proofFileName) ? "alert-outlined" : "primary"}
          className={styles["upload-button"]}
        >
          {proofUploadButtonLabel || t("label.uploadProofOfPreference")}
        </Button>
        {getNestedError(errors, proofFileName) && (
          <p className={styles["upload-error"]}>
            <FormErrorMessage>
              {getNestedError(errors, proofFileName)?.message as string}
            </FormErrorMessage>
          </p>
        )}
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
      <input className="hidden" {...getInputProps()} />
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
          <Button
            variant="text"
            size="sm"
            onClick={handleDeleteFile}
            className={styles["delete-button"]}
          >
            {t("t.delete")}
          </Button>
        </Card>
      )}
    </>
  )
}

export default PreferenceProofUploadField
