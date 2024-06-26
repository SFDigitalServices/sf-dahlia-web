# frozen_string_literal: true

require 'rails_helper'

describe ArcGISService::GeocodingService do
  def generate_candidate(loc_name, score)
    {
      score: score,
      attributes: { Loc_name: loc_name },
    }
  end

  describe 'clean_address' do
    before(:each) do
      @input_address = {
        address1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '12345',
      }
    end

    it 'parses basic addresses correctly' do
      service = ArcGISService::GeocodingService.new(@input_address)
      expected_address = {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
      }
      expect(service.address).to eq(expected_address)
    end

    it 'adds TI to street for addresses in treasure island' do
      @input_address[:zip] = '94130'
      service = ArcGISService::GeocodingService.new(@input_address)

      expect(service.address[:street]).to eq('123 Main TI St')
    end

    it 'does not include unit letters if provided' do
      @input_address[:address1] = '123 Main St, #A'
      service = ArcGISService::GeocodingService.new(@input_address)
      expect(service.address[:street]).to eq('123 Main St')

      @input_address[:address1] = '123 Main St Apt A'
      service = ArcGISService::GeocodingService.new(@input_address)
      expect(service.address[:street]).to eq('123 Main St')

      @input_address[:address1] = '123 Main St Apt 1'
      service = ArcGISService::GeocodingService.new(@input_address)
      expect(service.address[:street]).to eq('123 Main St')
    end

    it 'maintains directional prefix if present' do
      @input_address[:address1] = '123 North Main St'
      service = ArcGISService::GeocodingService.new(@input_address)
      expect(service.address[:street]).to eq('123 N Main St')

      @input_address[:address1] = '123 N Main St'
      service = ArcGISService::GeocodingService.new(@input_address)
      expect(service.address[:street]).to eq('123 N Main St')
    end
  end
  describe '.select_best_candidate' do
    context 'with nil passed' do
      it 'returns an empty object' do
        expect(ArcGISService::GeocodingService.select_best_candidate(nil)).to eq({})
      end
    end

    context 'with an empty list of candidates passed' do
      it 'returns an empty object' do
        expect(ArcGISService::GeocodingService.select_best_candidate([])).to eq({})
      end
    end

    context 'with a list of candidates passed' do
      context 'containing an acceptable EAS candidate and other candidates' do
        let(:test_candidates) do
          [
            generate_candidate('eas', 93),
            generate_candidate('StClines', 100),
            generate_candidate('city', 100),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns the EAS candidate' do
          expect(best_candidate).to eq(test_candidates[0])
        end
      end

      context 'containing an acceptable StClines candidate and ' \
        'no EAS candidate' do
        let(:test_candidates) do
          [
            generate_candidate('StClines', 85),
            generate_candidate('city', 100),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns the StClines candidate' do
          expect(best_candidate).to eq(test_candidates[0])
        end
      end

      context 'containing an acceptable non-EAS/non-StClines candidate and ' \
        'no EAS or StClines candidates' do
        let(:test_candidates) do
          [
            generate_candidate('city', 75),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns the non-EAS/non-StClines candidate' do
          expect(best_candidate).to eq(test_candidates[0])
        end
      end

      context 'containing an EAS candidate with an unacceptable score and ' \
        'a StClines candidate with an acceptable score' do
        let(:test_candidates) do
          [
            generate_candidate('eas', 1),
            generate_candidate('StClines', 100),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns the StClines candidate' do
          expect(best_candidate).to eq(test_candidates[1])
        end
      end

      context 'containing a StClines candidate with an unacceptable score and ' \
        'a non-EAS/non-StClines candidate with an acceptable score' do
        let(:test_candidates) do
          [
            generate_candidate('StClines', 1),
            generate_candidate('city', 100),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns the non-EAS/non-StClines candidate' do
          expect(best_candidate).to eq(test_candidates[1])
        end
      end

      context 'containing 0 candidates with acceptable scores for their Loc_name types' do
        let(:test_candidates) do
          [
            generate_candidate('eas', 92),
            generate_candidate('StClines', 84),
            generate_candidate('city', 74),
          ]
        end

        let(:best_candidate) do
          ArcGISService::GeocodingService.select_best_candidate(test_candidates)
        end

        it 'returns an empty object' do
          expect(best_candidate).to eq({})
        end
      end
    end
  end
end
