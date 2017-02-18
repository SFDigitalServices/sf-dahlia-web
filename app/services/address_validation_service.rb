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
    EasyPost.api_base = 'http://localhost:3000'
    @validation = EasyPost::Address.create(@address)
  end

  def invalid?
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
