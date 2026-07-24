require 'easypost'

# encapsulate all EasyPost / Address Validation methods
class AddressValidationService
  def initialize(address, verify = {})
    # default EasyPost verifications
    verify = %w[delivery] if verify.empty?
    @original_address = address.dup.freeze
    @address = address.merge(verify: verify)
    @easypost_error = false
    @easypost = EasyPost::Client.new(
      api_key: ENV.fetch('EASYPOST_API_KEY', nil), read_timeout: 10, open_timeout: 10,
    )
  end

  def validate
    return false unless @address.present?

    @easypost_error = false
    @validation = @easypost.address.create(@address)
  rescue EasyPost::Errors::EasyPostError => e
    Rails.logger.warn("Address validation: EasyPost error - #{e.message}")
    @easypost_error = true
    @validation = nil
    # return the original address without internal verify params
    @original_address
  end

  def easypost_error?
    @easypost_error
  end

  # Keep timeout? as an alias for backward compatibility
  alias timeout? easypost_error?

  def po_box?(validation)
    # If it's a valid PO Box, we'll see 'PO BOX' in the validation response
    # If it's a PO Box, but the number is invalid, we check for E.BOX_NUMBER.INVALID error
    # If it's a completely fake PO Box address, easy post returns address not found and
    #   does not normalize street1 so check case insensitive with optional periods and
    #   space, e.g. look for 'po box', 'P. O. Box'
    # https://www.easypost.com/errors-guide
    return false unless validation.present?

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
    # we don't treat EasyPost errors as "invalid" since we want to allow them to proceed
    if easypost_error?
      Rails.logger.warn('Address validation: EasyPost request failed, allowing address through')
      return false
    end

    # we do not accept PO Boxes
    if po_box?(@validation)
      Rails.logger.info('Address validation: Raised an address validation error for a PO Box')
      return true
    end

    if duplicate_unit?(@validation)
      Rails.logger.info('Address validation: Duplicate unit detected')
      return true
    end

    if @validation.present? && !@validation.verifications.delivery.success
      errors = Array(@validation.verifications.delivery.errors).map(&:code).compact
      Rails.logger.warn(
        "Address validation: EasyPost validation failed - error codes: #{errors.join(', ')}",
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
