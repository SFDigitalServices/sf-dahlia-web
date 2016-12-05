module ArcGISService
  # encapsulate all Neighborhood Boundary check methods
  #  - example: check 4053 18th st.
  #  - NeighborhoodBoundaryService.new('2198 Market', -13629293.1, 4545683.8)
  #    .in_boundary?
  #
  class NeighborhoodBoundaryService < ArcGISService::Base
    API_URL = ENV['NEIGHBORHOOD_BOUNDARY_SERVICE_URL'].freeze
    NAME = 'NRHP Boundary Check'.freeze

    ID_MAPPING = {
      '55 Laguna' => 1,
      '2198 Market' => 3,
    }.freeze

    def initialize(listing_name, x, y)
      super()
      @x = x
      @y = y
      @development_id = ID_MAPPING[listing_name]
    end

    def query_params
      {
        # where: "development='#{@listing_name}'",
        objectIds: @development_id,
        geometry: "#{@x},#{@y}",
        geometryType: 'esriGeometryPoint',
        spatialRel: 'esriSpatialRelIntersects',
        returnCountOnly: true,
        f: 'pjson',
      }
    end

    def in_boundary?
      count = json_data.try(:[], :count)
      count.present? && count > 0
    end
  end
end
