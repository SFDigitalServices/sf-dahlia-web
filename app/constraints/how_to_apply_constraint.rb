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
    # Status has to be Active && Accepting Online Applications has to be true
    listing['Status'] == 'Active' && listing['Accepting_Online_Applications'] == true
  end
end
