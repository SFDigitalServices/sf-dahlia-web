require 'rails_helper'

describe Rack::MaintenanceMode do
  let(:app) { ->(_env) { [200, { 'Content-Type' => 'text/plain' }, ['OK']] } }
  let(:request) { Rack::MockRequest.new(described_class.new(app)) }
  let(:flag) { described_class::MAINTENANCE_FLAG }
  let(:unleash) { Rails.configuration.unleash }
  let(:html) { 'text/html,application/xhtml+xml,*/*;q=0.8' }
  let(:axios) { 'application/json, text/plain, */*' }

  def maintenance_on
    allow(unleash).to receive(:is_enabled?).with(flag, anything).and_return(true)
  end

  context 'when the maintenance flag is off' do
    it 'passes the request through' do
      response = request.get('/', 'HTTP_ACCEPT' => html)
      expect(response.status).to eq(200)
      expect(response.body).to eq('OK')
    end
  end

  context 'when the maintenance flag is on' do
    before { maintenance_on }

    it 'returns the maintenance page for HTML requests' do
      response = request.get('/listings', 'HTTP_ACCEPT' => html)
      expect(response.status).to eq(503)
      expect(response.headers['Content-Type']).to eq('text/html; charset=utf-8')
      expect(response.headers['Retry-After']).to eq('3600')
      expect(response.body).to eq(File.read(Rails.public_path.join('503.html')))
    end

    it 'returns JSON for API requests with a browser-like Accept header' do
      response = request.get('/api/v1/listings', 'HTTP_ACCEPT' => axios)
      expect(response.status).to eq(503)
      expect(response.headers['Content-Type']).to eq('application/json; charset=utf-8')
      expect(response.headers['Retry-After']).to eq('3600')
      expect(JSON.parse(response.body))
        .to eq('message' => 'Service Unavailable', 'status' => 503)
    end

    it 'returns JSON for non-HTML requests' do
      response = request.get('/sitemap.xml', 'HTTP_ACCEPT' => 'application/xml')
      expect(response.status).to eq(503)
      expect(response.headers['Content-Type']).to eq('application/json; charset=utf-8')
    end

    it 'returns an empty body for HEAD requests' do
      response = request.request('HEAD', '/', 'HTTP_ACCEPT' => html)
      expect(response.status).to eq(503)
      expect(response.body).to be_empty
    end

    it 'checks the flag with the client IP' do
      request.get('/', 'REMOTE_ADDR' => '9.9.9.9')
      expect(unleash).to have_received(:is_enabled?)
        .with(flag, having_attributes(remote_address: '9.9.9.9'))
    end
  end

  context 'when the client IP is excluded from the flag' do
    before do
      allow(unleash).to receive(:is_enabled?)
        .with(flag, having_attributes(remote_address: '1.2.3.4')).and_return(false)
    end

    it 'passes the request through' do
      response = request.get('/', 'REMOTE_ADDR' => '1.2.3.4')
      expect(response.status).to eq(200)
    end
  end

  context 'when Unleash raises an error' do
    before { allow(unleash).to receive(:is_enabled?).and_raise(StandardError, 'boom') }

    it 'passes the request through' do
      response = request.get('/', 'HTTP_ACCEPT' => html)
      expect(response.status).to eq(200)
    end
  end
end
