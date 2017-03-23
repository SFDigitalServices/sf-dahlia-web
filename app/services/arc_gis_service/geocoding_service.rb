require 'street_address'

module ArcGISService
  # Geocoding service
  class GeocodingService < ArcGISService::Base
    attr_reader :address

    API_URL = ENV['GEOCODING_SERVICE_URL'].freeze
    NAME = 'Composite Geocoder'.freeze

    def initialize(address)
      super()
      @address = address
      clean_address
    end

    def clean_address
      address_string = "#{@address[:address1]}, #{@address[:city]}, #{@address[:state]}"
      addr = StreetAddress::US.parse(address_string)
      return nil unless addr
      street = addr.street
      # modify Treasure Island addresses to append TI
      street = "#{street} TI" if @address[:zip].to_s.include?('94130')
      @address = {
        # do not include unit type / unit number in :street
        street: "#{addr.number} #{street} #{addr.street_type}",
        city: addr.city || 'San Francisco',
        state: addr.state || 'CA',
      }
    end

    def query_params
      {
        Street: @address[:street],
        City: @address[:city],
        State: @address[:state],
        f: 'pjson',
        outfields: 'loc_name',
      }
    end

    def geocode
      json_data
    end
  end
end
