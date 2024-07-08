require 'rails_helper'

describe Overrides::RegistrationsController do
  let(:salesforce_response) do
    {
      firstName: 'Test',
      lastName: 'lastName',
      email: 'test@test.com',
      DOB: '1989-03-29',
      contactId: '0036C000001sI5oQAE',
    }.as_json
  end

  let(:valid_user_params) do
    {
      user: {
        id: 1,
        email: 'jane@doe.com',
        password: 'somepassword',
        password_confirmation: 'somepassword',
      },
      contact: {
        firstName: 'Jane',
        lastName: 'Doe',
        DOB: '1985-07-23',
        email: 'jane@doe.com',
      },
      confirm_success_url: 'http://localhost/my-account',
    }
  end

  let!(:user) do
    @user ||= User.create(
      email: 'jack@doe.com',
      password: 'somepassword',
      password_confirmation: 'somepassword',
    )
  end

  before(:each) do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  describe 'create' do
    it 'saves a salesforce contact id on user' do
      allow(Force::AccountService)
        .to receive(:create_or_update)
        .and_return(salesforce_response)

      post :create, params: valid_user_params

      expect(assigns(:resource).salesforce_contact_id)
        .to eq('0036C000001sI5oQAE')
    end

    it 'throws error if firstName includes invalid characters' do
      allow(Force::AccountService)
        .to receive(:create_or_update)
        .and_return(salesforce_response)

      post :create, params: {
        user: {
          id: 1,
          email: 'jane@doe.com',
          password: 'somepassword',
          password_confirmation: 'somepassword',
        },
        contact: {
          firstName: 'http',
          lastName: 'Doe',
          DOB: '1985-07-23',
          email: 'jane@doe.com',
        },
        confirm_success_url: 'http://localhost/my-account',
      }

      expect(response.status).to eq 422
    end

    it 'throws error if lastName includes invalid characters' do
      allow(Force::AccountService)
        .to receive(:create_or_update)
        .and_return(salesforce_response)

      post :create, params: {
        user: {
          id: 1,
          email: 'jane@doe.com',
          password: 'somepassword',
          password_confirmation: 'somepassword',
        },
        contact: {
          firstName: 'John',
          lastName: 'www',
          DOB: '1985-07-23',
          email: 'jane@doe.com',
        },
        confirm_success_url: 'http://localhost/my-account',
      }

      expect(response.status).to eq 422
    end
  end

  describe '#update' do
    let(:user_update_params) do
      {
        user: {
          email: 'jack2@doe.com',
        },
      }
    end

    before(:each) do
      user.update(allow_password_change: true)

      # Mocking for token authentication
      allow(controller).to receive(:update_auth_header).and_return(true)
      allow(controller).to receive(:set_user_by_token).and_return(user)
      allow(controller).to receive(:set_request_start).and_return(true)
      controller.instance_variable_set(:@resource, user)
    end

    # We no longer override the update method, but we want to confirm that email
    # change confirmation emails are being sent.
    it 'sends a reconfirmation email when email address is updated' do
      message_delivery = instance_double(ActionMailer::MessageDelivery)
      expect(Emailer).to receive(:confirmation_instructions)
        .once
        .and_return(message_delivery)
      expect(message_delivery).to receive(:deliver_later).once

      expect(assigns(:resource).uid).to eq 'jack@doe.com'

      put :update, params: user_update_params

      user.confirm

      expect(assigns(:resource).uid).to eq 'jack2@doe.com'

      expect(response.status).to eq 200
    end
  end
end
