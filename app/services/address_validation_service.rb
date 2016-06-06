require 'easypost'

# encapsulate all EasyPost / Address Validation methods
class AddressValidationService
  def initialize(address, verify = {})
    # default EasyPost verifications
    verify = %w[delivery zip4] if verify.empty?
    @address = address.merge(verify: verify)
  end

  def validate
    return false unless @address.present?
    @validation = EasyPost::Address.create(@address)
  end

  def invalid?
    return false unless @validation.present?
    !@validation.verifications.delivery.success ||
      @validation.street1.include?('PO BOX')
  end
end
