# RESTful JSON API to query for address validation
class Api::V1::AddressValidationController < ApiController
  def validate
    service = AddressValidationService.new(address_params)
    @validated_address = service.validate
    status = 200 # default to success
    status = 422 if service.invalid?
    render json: { address: @validated_address, error: service.error }, status: status
  end

  private

  def address_params
    params.require(:address)
          .permit(:company, :street1, :street2, :city, :state, :zip)
  end
end
