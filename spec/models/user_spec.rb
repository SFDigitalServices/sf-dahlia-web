require 'rails_helper'

describe User, type: :model do
  it 'should create a new instance of User given valid attributes' do
    create(:user)
  end
end
