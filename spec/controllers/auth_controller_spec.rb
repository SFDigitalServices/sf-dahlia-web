require 'rails_helper'

RSpec.describe AuthController do
  describe '#sign_in' do
    it 'loads sign in page successfully' do
      get :sign_in
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :sign_in
      expect(response).to render_template 'layouts/application-react'
    end
  end

  describe '#create_account' do
    it 'loads create account page successfully' do
      get :create_account
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :create_account
      expect(response).to render_template 'layouts/application-react'
    end
  end

  describe '#forgot_password' do
    it 'loads forgot password page successfully' do
      get :forgot_password
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :forgot_password
      expect(response).to render_template 'layouts/application-react'
    end
  end

  describe '#reset_password' do
    it 'loads reset password page successfully' do
      get :reset_password
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :reset_password
      expect(response).to render_template 'layouts/application-react'
    end
  end
end
