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

  describe 'move_to_unconfirmed' do
    let(:user) { create(:user, confirmed_at: Time.current, confirmation_sent_at: Time.current) }
    before do
      allow(user).to receive(:generate_confirmation_token!)
      allow(user).to receive(:send_confirmation_instructions)
    end

    context 'without expiring token' do
      it 'resets confirmation fields and sends instructions' do
        user.move_to_unconfirmed
        user.reload
        expect(user.confirmed_at).to be_nil
        expect(user.confirmation_sent_at).to be_nil
        expect(user).to have_received(:generate_confirmation_token!)
        expect(user).to have_received(:send_confirmation_instructions)
      end
    end

    context 'with expiring token' do
      it 'resets confirmation fields, sets confirmation_sent_at to 3 days ago, and sends instructions' do
        user.move_to_unconfirmed(expire_token: true)
        user.reload
        expect(user.confirmed_at).to be_nil
        expect(user.confirmation_sent_at).to be_within(1.second).of(3.days.ago)
        expect(user).to have_received(:generate_confirmation_token!)
        expect(user).to have_received(:send_confirmation_instructions)
      end
    end
  end
end
