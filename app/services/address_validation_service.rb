require 'easypost'

# encapsulate all EasyPost / Address Validation methods
class AddressValidationService
  def initialize(address, verify = {})
    # default EasyPost verifications
    verify = %w[delivery] if verify.empty?
    @address = address.merge(verify: verify)
    @timeout = false
  end

  def validate
    return false unless @address.present?
    @timeout = false
    @validation = EasyPost::Address.create(@address)
  rescue EasyPost::Error
    @timeout = true
    # just return the original address, unable to return a validated one
    @address
  end

  def timeout?
    @timeout
  end

  def po_box?(validation)
    # If it's a valid PO Box, we'll see 'PO BOX' in the validation response
    # If it's a PO Box, but the number is invalid, we check for E.BOX_NUMBER.INVALID error
    # https://www.easypost.com/errors-guide
    validation.street1.include?('PO BOX') || (
      !validation.verifications.delivery.success &&
      validation.verifications.delivery.errors[0].code == 'E.BOX_NUMBER.INVALID'
    )
  end

  def invalid?
    # we don't treat timeouts as "invalid" since we want to allow them to proceed
    Rails.logger.warn('Address validation: Easypost request timed out') if timeout?

    # Although we accept invalid addresses, we do not accept PO Boxes
    if @validation.present? && po_box?(@validation)
      Rails.logger.info(
        'Address validation: '\
        "Raised an address validation error for a PO Box #{@validation.to_json}",
      )
      return true
    end

    if @validation.present? && !@validation.verifications.delivery.success
      Rails.logger.warn(
        "Address validation: Easypost validation failed #{@validation.to_json}",
      )
    end
    false
  end

  def error
    return nil unless @validation.present?
    return 'PO BOX' if po_box?(@validation)
  end
end
