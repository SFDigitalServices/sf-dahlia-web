# Spec helpers for Devise Token auth
module DeviseMacros
  def login_user
    before(:each) do
      user = User.first || FactoryGirl.create(:user)
      token = user.create_new_auth_token
      @auth_headers = { Accept: 'application/json' }.merge(token)
    end
  end
end
