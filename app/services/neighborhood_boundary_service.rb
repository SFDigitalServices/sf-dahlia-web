require 'http'

# encapsulate all Neighborhood Boundary check methods
#  - example: check 4053 18th st.
#  - NeighborhoodBoundaryService.new('2198 Market', -13629293.1, 4545683.8)
#    .json_data
#
class NeighborhoodBoundaryService
  API_URL = 'https://sfgis-svc.sfgov.org/arcgis/rest/services/myr/NRHP_002/MapServer/0/query'.freeze
  ID_MAPPING = {
    '55 Laguna' => 1,
    '2198 Market' => 3,
  }.freeze

  def initialize(listing_name, x, y)
    @x = x
    @y = y
    @development_id = ID_MAPPING[listing_name]
  end

  def data
    query_params = {
      # where: "development='#{@listing_name}'",
      objectIds: @development_id,
      geometry: "#{@x},#{@y}",
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnCountOnly: true,
      f: 'pjson',
    }
    puts query_params.to_json
    puts query_params.inspect
    puts "#{API_URL}?#{query_params.to_query}"
    HTTP.get("#{API_URL}?#{query_params.to_query}").to_s
  end

  def json_data
    JSON.parse(data)
  rescue
    {}
  end

  def in_boundary?
    json_data['count'] > 0
  end
end
