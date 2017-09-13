# Spec helpers for Devise Token auth
module DeviseMacros
  def login_user
    before(:each) do
      qa_id = '0030P00001y3eLHQAY'
      user = User.find_by_salesforce_contact_id(qa_id)
      user ||= FactoryGirl.create(:user, salesforce_contact_id: qa_id)
      token = user.create_new_auth_token
      @auth_headers = { Accept: 'application/json' }.merge(token)
    end
  end
end
