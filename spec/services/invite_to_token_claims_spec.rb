require 'rails_helper'

describe InviteToTokenClaims do
  describe '.trusted_origin?' do
    # Given decoded claims from a token signed with the shared JWT secret
    # When the invite-to paths ask whether it was minted for an invite-to link
    # Then only email tokens (act) and next-steps page tokens (purpose) qualify
    {
      'an email token with act' => [{ 'act' => 'yes' }, true],
      'a next-steps page token' => [{ 'purpose' => 'next_steps' }, true],
      'a symbol-keyed next-steps token' => [{ purpose: 'next_steps' }, true],
      'a symbol-keyed email token' => [{ act: 'yes' }, true],
      'an act-less token without purpose' => [{ 'type' => 'I2I' }, false],
      'a blank act' => [{ 'act' => '' }, false],
      'some other purpose' => [{ 'purpose' => 'hc_session' }, false],
    }.each do |scenario, (claims, expected)|
      it "is #{expected} for #{scenario}" do
        expect(described_class.trusted_origin?(claims)).to be(expected)
      end
    end
  end

  describe '.parse_deadline' do
    it 'parses a date' do
      expect(described_class.parse_deadline('2099-01-01').to_date)
        .to eq(Date.new(2099, 1, 1))
    end

    # Time.zone.parse returns nil for some malformed input and raises on the rest
    ['not-a-date', '2024-13-45', nil].each do |deadline|
      it "is nil for #{deadline.inspect}" do
        expect(described_class.parse_deadline(deadline)).to be_nil
      end
    end
  end
end
