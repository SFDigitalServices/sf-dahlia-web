require 'rails_helper'

RSpec.describe DirectoryController do
  describe '#rent' do
    it 'loads directory page successfully' do
      get :rent
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :rent
      expect(response).to render_template 'layouts/application-react'
    end

    it 'renders in react when react=true param passed' do
      get :rent, params: { react: 'true' }
      expect(response).to render_template 'layouts/application-react'
    end

    it 'renders in angular when react=false param passed' do
      get :rent, params: { react: 'false' }
      expect(response).to render_template 'layouts/application-angular'
    end
  end

  describe '#sale' do
    it 'loads directory page successfully' do
      get :sale
      expect(response).to be_ok
    end

    it 'renders in react by default' do
      get :sale
      expect(response).to render_template 'layouts/application-react'
    end

    it 'renders in react when react=true param passed' do
      get :sale, params: { react: 'true' }
      expect(response).to render_template 'layouts/application-react'
    end

    it 'renders in angular when react=false param passed' do
      get :sale, params: { react: 'false' }
      expect(response).to render_template 'layouts/application-angular'
    end
  end
end
