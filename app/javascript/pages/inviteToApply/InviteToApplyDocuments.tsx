import React from "react"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"

interface InviteToApplyDocumentsProps {
  listing: RailsSaleListing | null
}

const InviteToApplyDocuments = ({ listing }: InviteToApplyDocumentsProps) => {
  return <h1>{listing?.Name}</h1>
}

export default InviteToApplyDocuments
