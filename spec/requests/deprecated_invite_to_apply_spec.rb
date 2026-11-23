require 'rails_helper'

# Given a deprecated /invite-to-apply link (any language prefix, page or documents),
#   carrying a signed invite token
# When a user opens it
# Then they get the 404 page
# And InviteToController is never reached: no token decoded, no Salesforce lookup,
#   no response recorded
describe 'Deprecated invite-to-apply pages', type: :request do
  listing_id = 'listingId'
  lang_prefixes = ['', '/en', '/es', '/zh', '/tl']

  let(:token) do
    JsonWebTokenService.encode_token(
      { type: 'I2A', deadline: (Time.zone.today + 30).to_s, act: 'yes', appId: 'applicationId' },
    )
  end
  let(:not_found_page) { File.read(Rails.public_path.join('404.html')) }

  before do
    stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
    allow(JsonWebTokenService).to receive(:decode_token).and_call_original
    allow(Force::ShortFormService).to receive(:get)
    allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
  end

  lang_prefixes.product(['', '/documents']).each do |prefix, suffix|
    path = "#{prefix}/listings/#{listing_id}/invite-to-apply#{suffix}"

    it "returns the 404 page for #{path}" do
      get path, params: { t: token }

      expect(response).to have_http_status(:not_found)
      expect(response.body).to eq(not_found_page)
    end

    it "does not decode the token or call Salesforce for #{path}" do
      get path, params: { t: token }

      expect(JsonWebTokenService).not_to have_received(:decode_token)
      expect(Force::ShortFormService).not_to have_received(:get)
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end
  end
end
