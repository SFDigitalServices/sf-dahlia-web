require 'rails_helper'

describe AddressValidationService do
  let(:address) do
    {
      street1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
    }
  end

  let(:mock_client) { instance_double(EasyPost::Client) }
  let(:mock_address_service) { double('address_service') }

  before do
    allow(EasyPost::Client).to receive(:new).and_return(mock_client)
    allow(mock_client).to receive(:address).and_return(mock_address_service)
  end

  describe '#validate' do
    context 'when EasyPost raises an API error (invalid/expired key)' do
      before do
        allow(mock_address_service).to receive(:create).and_raise(
          EasyPost::Errors::ApiError.new('Invalid API key'),
        )
      end

      it 'returns the original address without verify params' do
        service = AddressValidationService.new(address)
        result = service.validate
        expect(result).to eq(address)
        expect(result).not_to have_key(:verify)
      end

      it 'sets easypost_error to true' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.easypost_error?).to be true
      end

      it 'keeps timeout? as alias for backward compat' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.timeout?).to be true
      end
    end

    context 'when EasyPost raises a timeout error' do
      before do
        allow(mock_address_service).to receive(:create).and_raise(
          EasyPost::Errors::TimeoutError.new('Request timed out'),
        )
      end

      it 'returns the original address' do
        service = AddressValidationService.new(address)
        result = service.validate
        expect(result).to eq(address)
      end

      it 'sets easypost_error to true' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.easypost_error?).to be true
      end
    end

    context 'when EasyPost raises a generic EasyPostError' do
      before do
        allow(mock_address_service).to receive(:create).and_raise(
          EasyPost::Errors::EasyPostError.new('Something went wrong'),
        )
      end

      it 'returns the original address' do
        service = AddressValidationService.new(address)
        result = service.validate
        expect(result).to eq(address)
      end

      it 'sets easypost_error to true' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.easypost_error?).to be true
      end

      it 'logs a warning with the error message' do
        allow(Rails.logger).to receive(:warn)
        service = AddressValidationService.new(address)
        service.validate
        expect(Rails.logger).to have_received(:warn).with(
          'Address validation: EasyPost error - Something went wrong',
        )
      end
    end

    context 'when EasyPost raises a connection error (network failure)' do
      before do
        allow(mock_address_service).to receive(:create).and_raise(
          EasyPost::Errors::ConnectionError.new('Connection refused'),
        )
      end

      it 'returns the original address' do
        service = AddressValidationService.new(address)
        result = service.validate
        expect(result).to eq(address)
      end

      it 'sets easypost_error to true' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.easypost_error?).to be true
      end
    end
    context 'when EasyPost succeeds' do
      let(:mock_validation) { double('validation') }

      before do
        allow(mock_address_service).to receive(:create).and_return(mock_validation)
      end

      it 'returns the validation result' do
        service = AddressValidationService.new(address)
        expect(service.validate).to eq(mock_validation)
      end

      it 'does not set easypost_error' do
        service = AddressValidationService.new(address)
        service.validate
        expect(service.easypost_error?).to be false
      end
    end
  end

  describe '#invalid? and #error after EasyPost failure' do
    before do
      allow(mock_address_service).to receive(:create).and_raise(
        EasyPost::Errors::EasyPostError.new('Service unavailable'),
      )
      allow(Rails.logger).to receive(:warn)
    end

    it 'does not raise NoMethodError when calling invalid?' do
      service = AddressValidationService.new(address)
      service.validate
      expect { service.invalid? }.not_to raise_error
    end

    it 'returns false from invalid? (allows address through)' do
      service = AddressValidationService.new(address)
      service.validate
      expect(service.invalid?).to be false
    end

    it 'returns nil from error' do
      service = AddressValidationService.new(address)
      service.validate
      expect(service.error).to be_nil
    end
  end
end
