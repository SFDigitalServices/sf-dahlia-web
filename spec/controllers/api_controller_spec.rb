require 'rails_helper'

RSpec.describe ApiController do
  describe '#render_err' do
    it 'returns json with correct status code' do
      params = { json: { message: 'StandardError, StandardError', status: 503 },
                 status: :service_unavailable }
      expect(@controller).to receive(:render).with(params)
      @controller.send :render_err, StandardError.new,
                       status: :service_unavailable,
                       external_capture: true
    end
  end
end
