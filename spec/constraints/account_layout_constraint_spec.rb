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

    it 'redirects my-account to /account' do
      get '/my-account'

      expect(response).to redirect_to '/account'
    end
  end
end
