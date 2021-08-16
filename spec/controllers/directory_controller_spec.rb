require 'rails_helper'

RSpec.describe DirectoryController do
  let(:react_flag_key) { 'DIRECTORY_PAGE_REACT' }

  describe '#rent' do
    describe 'when DIRECTORY_PAGE_REACT env var is nil' do
      before(:each) do
        ENV[react_flag_key] = nil
      end

      it 'loads rental directory page successfully' do
        get :rent
        expect(response).to be_ok
      end

      it 'renders in angular by default' do
        get :rent
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :rent, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :rent, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when DIRECTORY_PAGE_REACT env var is true' do
      before(:each) do
        ENV[react_flag_key] = 'true'
      end

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

      it 'renders in react when react=false param passed' do
        get :rent, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when DIRECTORY_PAGE_REACT env var is false' do
      before(:each) do
        ENV[react_flag_key] = 'false'
      end

      it 'loads directorypage successfully' do
        get :rent
        expect(response).to be_ok
      end

      it 'renders in react by default' do
        get :rent
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :rent, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :rent, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end
  end

  describe '#sale' do
    describe 'when DIRECTORY_PAGE_REACT env var is nil' do
      before(:each) do
        ENV[react_flag_key] = nil
      end

      it 'loads sale directory page successfully' do
        get :sale
        expect(response).to be_ok
      end

      it 'renders in angular by default' do
        get :sale
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :sale, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :sale, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when DIRECTORY_PAGE_REACT env var is true' do
      before(:each) do
        ENV[react_flag_key] = 'true'
      end

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

      it 'renders in react when react=false param passed' do
        get :sale, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when DIRECTORY_PAGE_REACT env var is false' do
      before(:each) do
        ENV[react_flag_key] = 'false'
      end

      it 'loads directorypage successfully' do
        get :sale
        expect(response).to be_ok
      end

      it 'renders in react by default' do
        get :sale
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :sale, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :sale, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end
  end
end
