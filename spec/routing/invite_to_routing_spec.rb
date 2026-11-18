require 'rails_helper'

describe 'Invite-to routes', type: :routing do
  listing_id = 'listingId'
  lang_prefixes = ['', '/en', '/es', '/zh', '/tl']

  def controller_for(path)
    Rails.application.routes.recognize_path(path, method: :get)[:controller]
  rescue ActionController::RoutingError
    nil
  end

  # Given a deprecated /invite-to-apply link (with or without a language prefix)
  # When Rails resolves the route
  # Then it never reaches InviteToController, so no invite token is decoded
  lang_prefixes.product(['', '/documents']).each do |prefix, suffix|
    path = "#{prefix}/listings/#{listing_id}/invite-to-apply#{suffix}"

    it "does not route #{path} to invite_to" do
      expect(controller_for(path)).not_to eq('invite_to')
    end
  end

  # Given a /next-steps link (with or without a language prefix)
  # When Rails resolves the route
  # Then it still reaches InviteToController
  lang_prefixes.each do |prefix|
    lang_param = prefix.empty? ? {} : { lang: prefix.delete('/') }

    it "routes #{prefix}/listings/:id/next-steps to invite_to#index" do
      expect(get: "#{prefix}/listings/#{listing_id}/next-steps")
        .to route_to('invite_to#index', id: listing_id, **lang_param)
    end

    it "routes #{prefix}/listings/:id/next-steps/documents to invite_to#documents" do
      expect(get: "#{prefix}/listings/#{listing_id}/next-steps/documents")
        .to route_to('invite_to#documents', id: listing_id, **lang_param)
    end
  end

  # Given a POST to the deprecated invite-to-apply record-response endpoint
  # When Rails resolves the route
  # Then it is not routable, so InviteToResponseController is never reached
  it 'does not route POST /api/v1/invite-to-apply/record-response' do
    expect(post: '/api/v1/invite-to-apply/record-response').not_to be_routable
  end

  # Given a POST to the next-steps record-response endpoint
  # When Rails resolves the route
  # Then it still reaches InviteToResponseController
  it 'routes POST /api/v1/next-steps/record-response to invite_to_response#record_response' do
    expect(post: '/api/v1/next-steps/record-response')
      .to route_to('api/v1/invite_to_response#record_response')
  end
end
