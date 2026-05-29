require_relative '../../app/constraints/account_layout_constraint'
require 'rails_helper'

describe 'Account layout routing', type: :request do
  context 'when the new account layout flag is on' do
    before do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('temp.webapp.newAccountLayout')
        .and_return(true)
    end

    it 'navigates to the new account layout page' do
      get '/account'

      expect(response).to render_template :account
    end

    it 'redirects my-account to /account' do
      get '/my-account'

      expect(response).to redirect_to '/account'
    end
  end

  context 'when the new account layout flag is off' do
    before do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('temp.webapp.newAccountLayout')
        .and_return(false)
    end

    it 'navigates to the old account page at /my-account' do
      get '/my-account'

      expect(response).to render_template :my_account
    end

    it 'redirects /account to /my-account' do
      get '/account'

      expect(response).to redirect_to '/my-account'
    end
  end
end
