require 'rails_helper'

describe Overrides::PasswordsController do
  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  let!(:user) do
    @user ||= User.create(
      email: 'jane@doe.com',
      password: 'somepassword1',
      password_confirmation: 'somepassword1',
    )
  end

  describe '#create' do
    it 'should send an email' do
      expect_any_instance_of(User).to receive(:send_devise_notification).and_return(true)
      params = {
        email: user.email,
        redirect_url: 'http://localhost:3000/forgot-password',
      }
      post :create, params: params
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
        params = {
          email: user.email,
          reset_password_token: token,
          redirect_url: 'http://localhost:3000/reset-password',
        }
        get :edit, params: params
      end.to change { user.reload.allow_password_change }.to(true)

      expect(response.status).to eq 302
    end

    it 'should redirect to home page if user not found' do
      @token = ''
      controller.instance_variable_set(:@resource, nil)
      params = {
        email: user.email,
        reset_password_token: token,
        redirect_url: 'http://localhost:3000/reset-password',
      }
      get :edit, params: params

      expect(response).to redirect_to('/')
    end
  end

  describe '#update' do
    before(:each) do
      user.update(allow_password_change: true)

      # Mocking for token authentication
      allow(controller).to receive(:update_auth_header).and_return(true)
      allow(controller).to receive(:set_user_by_token).and_return(user)
      allow(controller).to receive(:set_request_start).and_return(true)
      controller.instance_variable_set(:@resource, user)
    end

    it 'should update password' do
      expect(controller).to receive(:render_update_success).and_return(true)
      expect do
        params = { password: 'newpassword1', password_confirmation: 'newpassword1' }
        put :update, params: params
      end.to(change { user.encrypted_password })

      expect(response.status).to eq 204
    end

    it 'should call Emailer on success' do
      message_delivery = instance_double(ActionMailer::MessageDelivery)
      expect(Emailer).to receive(:account_update).and_return(message_delivery)
      allow(message_delivery).to receive(:deliver_later)

      expect do
        params = { password: 'newpassword1', password_confirmation: 'newpassword1' }
        put :update, params: params
      end.to(change { user.encrypted_password })

      expect(response.status).to eq 200
    end
  end
end
