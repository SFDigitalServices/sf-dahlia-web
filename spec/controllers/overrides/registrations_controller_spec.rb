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
  end

  describe '#update' do
    # We no longer override the update method, but we want to confirm that email
    # change confirmation emails are being sent.
    let(:user_update_params) do
      {
        user: {
          id: 1,
          email: 'jane2@doe.com',
        },
      }
    end

    it 'sends a reconfirmation email when email address is updated' do
      allow(Force::AccountService)
        .to receive(:create_or_update)
        .and_return(salesforce_response)

      message_delivery = instance_double(ActionMailer::MessageDelivery)
      # Expect 2 emails, once for original confirmation, and once for email change.
      expect(Emailer)
        .to receive(:confirmation_instructions)
        .twice
        .and_return(message_delivery)
      allow(message_delivery).to receive(:deliver_later)
      # First, create the valid user
      post :create, params: valid_user_params
      @resource = assigns(:resource)
      # Then update the user
      put :update, params: user_update_params
    end
  end
end
