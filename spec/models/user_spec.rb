require 'rails_helper'

describe User, type: :model do
  it 'should create a new instance of User given valid attributes' do
    create(:user)
  end

  describe 'validations' do
    subject { build(:user) } # Using FactoryBot to build a user instance

    it 'is valid with valid attributes' do
      expect(subject).to be_valid
    end

    it 'is not valid without an email' do
      subject.email = nil
      expect(subject).to_not be_valid
      expect(subject.errors[:email]).to include("can't be blank")
    end

    it 'is not valid with a duplicate email' do
      create(:user, email: "test@example.com")
      duplicate_user = build(:user, email: "test@example.com")
      expect(duplicate_user).to_not be_valid
      expect(duplicate_user.errors[:email]).to include("has already been taken")
    end

    it 'is not valid with a duplicate email case insensitive' do
      create(:user, email: "test@example.com")
      duplicate_user = build(:user, email: "TEST@EXAMPLE.COM")
      expect(duplicate_user).to_not be_valid
      expect(duplicate_user.errors[:email]).to include("has already been taken")
    end
  end
end
