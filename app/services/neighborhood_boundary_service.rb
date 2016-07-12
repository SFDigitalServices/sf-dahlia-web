require 'http'

# encapsulate all Neighborhood Boundary check methods
#  - example: check 4053 18th st.
#  - NeighborhoodBoundaryService.new('55 Laguna', -13629293.1, 4545683.8)
#    .json_data
#
class NeighborhoodBoundaryService
  API_URL = 'https://sfgis-svc.sfgov.org/arcgis/rest/services/myr/NRHP_001/MapServer/0/query'.freeze

  def initialize(listing_name, x, y)
    @x = x
    @y = y
    @listing_name = listing_name
  end

  def data
    query_params = {
      where: "development='#{@listing_name}'",
      geometry: "#{@x},#{@y}",
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry: true,
      returnIdsOnly: false,
      returnCountOnly: false,
      returnZ: false,
      returnM: false,
      returnDistinctValues: false,
      returnTrueCurves: false,
      f: 'pjson',
    }
    HTTP.get(API_URL + "?#{query_params.to_query}").to_s
  end

  def json_data
    JSON.parse(data)
  end

  def in_boundary?
    json_data['features'].present?
  end
end
