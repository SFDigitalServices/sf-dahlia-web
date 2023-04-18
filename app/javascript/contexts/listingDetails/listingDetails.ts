interface ListingDetails {
  /**  */
  uid: string

  /**  */
  email: string

  /**  */
  created_at: Date

  /**  */
  updated_at: Date
}

interface ListingDetailsData {
  data: any
  success: boolean
}

export { ListingDetails, ListingDetailsData }
