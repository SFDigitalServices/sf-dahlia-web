# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  before_action :authenticate_user!

  def agencies
    render json: { agencies: Force::HousingCounselorService.agencies }
  end
end
