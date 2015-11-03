require 'rails_helper'

RSpec.describe HomeController do
  describe '#index' do
    it 'loads homepage successfully' do
      get :index
      expect(response).to be_ok
    end
  end
end
