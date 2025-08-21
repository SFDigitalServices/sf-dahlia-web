require 'rails_helper'

RSpec.describe FormController do
  describe '#listing_apply_form' do
    it 'loads listing apply form page successfully' do
      get :listing_apply_form, params: { id: 'a0123' }
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :listing_apply_form, params: { id: 'a0123' }
      expect(response).to render_template 'layouts/application-react'
    end
  end
end
