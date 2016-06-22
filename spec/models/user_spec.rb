require 'rails_helper'

describe User, type: :model do
  before(:each) do
    @user_attrs = {
      email: 'test@person.com',
      password: 'abc123abc',
      password_confirmation: 'abc123abc',
    }
  end

  it 'should create a new instance of User given valid attributes' do
    User.create!(@user_attrs)
  end
end
