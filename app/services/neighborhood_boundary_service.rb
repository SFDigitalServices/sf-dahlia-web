require 'http'

# encapsulate all Neighborhood Boundary check methods
class NeighborhoodBoundaryService
  API_URL = 'https://data.sfgov.org/resource/b3d4-gcg7.json'.freeze

  def initialize(lat, lng, distance = 100)
    @lat = lat
    @lng = lng
    @distance = distance
    @http = HTTP.basic_auth(
      user: ENV['SFGOV_DATA_USERNAME'],
      pass: ENV['SFGOV_DATA_PASSWORD'],
    )
  end

  def data
    query_params = {
      '$where' => "intersects(the_geom, 'POINT(#{@lng} #{@lat})')",
    }
    @http.get(API_URL + "?#{query_params.to_query}")
  end
end

# NeighborhoodBoundaryService.new(37.7611379,-122.4363629).data.to_s
