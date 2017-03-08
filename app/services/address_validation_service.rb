require 'easypost'

# encapsulate all EasyPost / Address Validation methods
class AddressValidationService
  def initialize(address, verify = {})
    # default EasyPost verifications
    verify = %w[delivery zip4] if verify.empty?
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

  def invalid?
    # we don't treat timeouts as "invalid" since we want to allow them to proceed
    return false if timeout?
    return false unless @validation.present?
    !@validation.verifications.delivery.success ||
      @validation.street1.include?('PO BOX')
  end

  def error
    return nil unless @validation.present? &&
                      @validation.verifications.delivery.errors.present?
    return 'PO BOX' if @validation.street1.include?('PO BOX')
    @validation.verifications.delivery.errors.first.message
  end
end
