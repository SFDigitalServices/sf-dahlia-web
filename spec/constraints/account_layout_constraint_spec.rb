require_relative '../../app/constraints/account_layout_constraint'
require 'rails_helper'

describe AccountLayoutConstraint do
  describe '#matches? account layout', type: :request do

    it 'navigates to the new account layout page when the flag is on' do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('temp.webapp.newAccountLayout')
        .and_return(true)
      get '/account'

      expect(response).to render_template :account
    end

    it 'redirects to the old account layout page when the flag is off' do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('temp.webapp.newAccountLayout')
        .and_return(false)
      get '/account'

      expect(response).to redirect_to '/my-account'
    end
  end
end
