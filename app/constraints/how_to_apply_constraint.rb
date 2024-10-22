# Constraint for visiting (:lang)/listings/:id/how-to-apply
class HowToApplyConstraint
  def matches?(request)
    # if the FCFS feature flag is enabled
    listing_id = request.params['id']
    listing = Force::ListingService.listing(listing_id)
    return true if fcfs_flag_enabled &&
                   listing_type_fcfs_sales_bmr(listing) &&
                   listing_active(listing)
  end

  def fcfs_flag_enabled
    Rails.configuration.unleash.is_enabled? 'FCFS'
  end

  def listing_type_fcfs_sales_bmr(listing)
    # Record Type has to be Ownership
    # Listing Type has to be First Come, First Served
    listing['RecordType']['Name'] == 'Ownership' &&
      listing['Listing_Type'] == 'First Come, First Served'
  end

  def listing_active(listing)
    # Status has to be Active
    # TODO: DAH-2846 Status will be added to the listing object
    # Until then, that field will be nil
    (!listing['Status'].nil? && listing['Status'] == 'Active') ||
      # Accepting Online Applications has to be true
      listing['Accepting_Online_Applications'] == true
  end
end
