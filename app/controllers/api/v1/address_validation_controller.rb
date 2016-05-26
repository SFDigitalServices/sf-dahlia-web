# RESTful JSON API to query for address validation
class Api::V1::AddressValidationController < ApiController
  def validate
    # -- example API call
    # EasyPost::Address.create(
    #   company: 'EasyPost',
    #   street1: '118 2nd Street',
    #   street2: '4th Floor',
    #   city: 'San Francisco',
    #   state: 'CA',
    #   zip: '94105',
    #   phone: '415-456-7890',
    #   verify_strict: %w[delivery zip4],
    # )
    @validation = EasyPost::Address.create(address_params)
    render json: { address: @validation }
  end

  private

  def address_params
    params.require(:address)
          .permit(:company, :street1, :street2, :city, :state, :zip)
          .merge(verify: %w[delivery zip4])
  end
end
