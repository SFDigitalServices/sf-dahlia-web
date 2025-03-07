require 'easypost'

# encapsulate all EasyPost / Address Validation methods
class AddressValidationService
  def initialize(address, verify = {})
    # default EasyPost verifications
    verify = %w[delivery] if verify.empty?
    @address = address.merge(verify: verify)
    @timeout = false
    @easypost = EasyPost::Client.new(
      api_key: ENV.fetch('EASYPOST_API_KEY', nil), read_timeout: 10, open_timeout: 10,
    )
  end

  def validate
    return false unless @address.present?

    @timeout = false
    @validation = @easypost.address.create(@address)
  rescue @easypost.error
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
    # If it's a completely fake PO Box address, easy post returns address not found and
    #   does not normalize street1 so check case insensitive with optional periods and
    #   space, e.g. look for 'po box', 'P. O. Box'
    # https://www.easypost.com/errors-guide
    false unless validation.present?

    validation.street1.match(/P\.?\s*O\.?\s*BOX/i) || (
      !validation.verifications.delivery.success &&
      validation.verifications.delivery.errors[0].code == 'E.BOX_NUMBER.INVALID'
    )
  end

  def duplicate_unit?(validation)
    # Check for duplicate apt/unit no on street lines 1 and 2
    validation.present? && validation.street2.present? && validation.street1.present? &&
      validation.street1.end_with?(validation.street2)
  end

  def invalid?
    # we don't treat timeouts as "invalid" since we want to allow them to proceed
    Rails.logger.warn('Address validation: Easypost request timed out') if timeout?

    # we do not accept PO Boxes
    if po_box?(@validation)
      Rails.logger.info(
        'Address validation: ' \
        "Raised an address validation error for a PO Box #{@validation.to_json}",
      )
      return true
    end

    if duplicate_unit?(@validation)
      Rails.logger.info("Address validation: Duplicate unit #{@validation.to_json}")
      return true
    end

    if @validation.present? && !@validation.verifications.delivery.success
      Rails.logger.warn(
        "Address validation: Easypost validation failed #{@validation.to_json}",
      )
      return true
    end

    false
  end

  def error
    return 'PO BOX' if po_box?(@validation)
    return 'DUPLICATE UNIT' if duplicate_unit?(@validation)
    return nil unless
      @validation.present? && @validation.verifications.delivery.errors.present?

    @validation.verifications.delivery.errors.first.message
  end
end
