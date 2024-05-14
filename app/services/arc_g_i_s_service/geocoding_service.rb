# frozen_string_literal: true

require 'street_address'

module ArcGISService
  # Encapsulate address geocoding functionality.
  class GeocodingService < ArcGISService::Base
    attr_reader :address

    API_URL = ENV['GEOCODING_SERVICE_URL']
    EAS_CANDIDATE_SCORE_MIN = 93
    STCLINES_CANDIDATE_SCORE_MIN = 85
    OTHER_CANDIDATE_SCORE_MIN = 75

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
      # add directional prefix (N/S/E/W, etc) back
      street = "#{addr.prefix} #{street}" if addr.prefix
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

    # The rules here for selecting the best candidate were given to us by
    # Charles MacNulty from the city geocoding service. They are meant to
    # match the rules that city employees who work on DAHLIA use when
    # manually geocoding addresses. In the future we may work with those city
    # employees to create a way to ensure that we all get the numbers used as
    # minimum acceptable score values from a central source. It's important
    # that all addresses are geocoded using the same standards to ensure
    # fairness in the application process.
    def self.select_best_candidate(candidates)
      return {} unless candidates.present?

      # Select only the candidates that have a high enough score. We group by
      # Loc_name type because there is an order of which types are more
      # preferred. That order is:
      # 1) eas
      # 2) StClines
      # 3) Any other Loc_name value
      eas_acceptable_candidates = candidates.select do |c|
        c[:attributes][:Loc_name] == 'eas' &&
          c[:score] >= EAS_CANDIDATE_SCORE_MIN
      end
      stclines_acceptable_candidates = candidates.select do |c|
        c[:attributes][:Loc_name] == 'StClines' &&
          c[:score] >= STCLINES_CANDIDATE_SCORE_MIN
      end
      other_acceptable_candidates = candidates.select do |c|
        !%w[eas StClines].include?(c[:attributes][:Loc_name]) &&
          c[:score] >= OTHER_CANDIDATE_SCORE_MIN
      end

      # Return the highest-scoring candidate available, in order of preference by type.
      [
        eas_acceptable_candidates,
        stclines_acceptable_candidates,
        other_acceptable_candidates,
      ].each do |cands|
        best_candidate = cands.max_by { |c| c[:score] }
        return best_candidate if best_candidate
      end

      # If we didn't find any acceptable candidate, return empty object.
      {}
    end
  end
end
