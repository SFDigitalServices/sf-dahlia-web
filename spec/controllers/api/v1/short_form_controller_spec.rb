# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ShortFormController do
  describe '#lending_institutions' do
    it 'returns calls Force::ShortFormService' do
      expect(Force::ShortFormService).to receive(:lending_institutions)
      get :lending_institutions
    end
  end

  describe '#lending_institutions_dalp' do
    it 'returns calls Force::ShortFormService' do
      expect(Force::ShortFormService).to receive(:lending_institutions_dalp)
      get :lending_institutions_dalp
    end
  end
end
