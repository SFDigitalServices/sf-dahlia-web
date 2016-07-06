require 'street_address'
require 'open-uri'

# encapsulate all geocoding methods
class GeocodingService
  attr_reader :address

  API_URL = 'https://sfgis-svc.sfgov.org/arcgis/rest/services/myr/NP_Composite_001/GeocodeServer/findAddressCandidates'.freeze
  EARTH_RADIUS = 6_378_137.0
  DEGREE_PER_RADIAN = (180 / Math::PI)

  def initialize(address)
    @address = address
    clean_address
  end

  def clean_address
    address_string = "#{@address[:address1]}, #{@address[:city]}, CA"
    addr = StreetAddress::US.parse(address_string)
    return nil unless addr
    street = addr.street
    # modify Treasure Island addresses to append TI
    street = "#{street} TI" if @address[:zip].to_s.include?('94130')
    @address = {
      # do not include unit type / unit number in :street
      street: "#{addr.number} #{street} #{addr.street_type}",
      city: addr.city || 'San Francisco',
    }
  end

  def data
    query_params = {
      Street: @address[:street],
      City: @address[:city],
      f: 'pjson',
    }
    open(API_URL + "?#{query_params.to_query}").read
  end

  def json_data
    JSON.parse(data)
  end

  def geocode
    result = json_data['candidates'].first
    if result && result['location'].present?
      x = result['location']['x']
      y = result['location']['y']
      return result.merge(
        coordinates: _get_coordinates(x, y),
      )
    end
  end

  def _get_coordinates(x, y)
    b = (x / EARTH_RADIUS) * DEGREE_PER_RADIAN
    lon = b - (((b + 180.0) / 360.0).floor * 360.0)
    d = (Math::PI / 2) - (2 * Math.atan(Math.exp((-1.0 * y) / EARTH_RADIUS)))
    lat = d * DEGREE_PER_RADIAN
    [lat, lon]
  end
end
