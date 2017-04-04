module ArcGISService
  # encapsulate all Neighborhood Boundary check methods
  #  - example: check 4053 18th st.
  #  ArcGISService::NeighborhoodBoundaryService.new('2014-009', -13629293.1, 4545683.8)
  #  .in_boundary?
  #
  class NeighborhoodBoundaryService < ArcGISService::Base
    API_URL = ENV['NEIGHBORHOOD_BOUNDARY_SERVICE_URL'].freeze
    NAME = 'NRHP Boundary Check'.freeze

    def initialize(project_id, x, y)
      super()
      @x = x
      @y = y
      @project_id = project_id
    end

    def query_params
      {
        where: "projid='#{@project_id}'",
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
