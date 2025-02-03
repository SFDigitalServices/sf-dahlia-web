# Constraint for visiting (:lang)/listings/:id/how-to-apply
class DalpConstraint
  def matches?(request)
    listing_id = request.params['id']
    listing = Force::ListingService.listing(listing_id)
    unless listing['Custom_Listing_Type'] == 'Downpayment Assistance Loan Program'
      return true
    end

    false
  end
end
