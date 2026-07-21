# frozen_string_literal: true

module Force
  class HousingCounselorService
    def self.agencies
      Request.new.cached_get('/housingCounselingAgencies/')
    end
  end
end
