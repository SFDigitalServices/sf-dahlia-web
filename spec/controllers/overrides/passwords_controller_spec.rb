require 'rails_helper'

describe Overrides::PasswordsController do
  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  let!(:user) do
    @user ||= User.create(
      email: 'jane@doe.com',
      password: 'somepassword',
      password_confirmation: 'somepassword',
    )
  end

  describe '#create' do
    it 'should send an email' do
      expect_any_instance_of(User).to receive(:send_devise_notification).and_return(true)
      post :create, email: user.email, redirect_url: 'http://localhost:3000/forgot-password'
      expect(response.status).to eq 200
    end
  end

  describe '#edit' do
    let(:token) do
      allow_any_instance_of(User).to receive(:send_devise_notification).and_return(true)
      @token ||= user.send_reset_password_instructions
    end

    it 'change allow_password_change to true' do
      expect do
        get :edit, email: user.email, reset_password_token: token, redirect_url: 'http://localhost:3000/forgot-password'
      end.to change { user.reload.allow_password_change }.to(true)

      expect(response.status).to eq 302
    end
  end
end
