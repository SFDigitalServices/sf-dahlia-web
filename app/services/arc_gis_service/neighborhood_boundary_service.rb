module ArcGISService
  # encapsulate all Neighborhood Boundary check methods
  #  - example: check 4053 18th st.
  #  - NeighborhoodBoundaryService.new('2198 Market', -13629293.1, 4545683.8)
  #    .in_boundary?
  #
  class NeighborhoodBoundaryService < ArcGISService::Base
    API_URL = 'https://sfgis-svc.sfgov.org/arcgis/rest/services/myr/NRHP_002/MapServer/0/query'.freeze
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
      boundary_match = json_data

      if boundary_match[:count].present?
        { boundary_match: json_data[:count] > 0 }
      else
        boundary_match
      end
    end
  end
end
