require 'rails_helper'

RSpec.describe HomeController do
  let(:react_flag_key) { 'HOME_PAGE_REACT' }

  describe '#index' do
    describe 'when HOME_PAGE_REACT env var is nil' do
      before(:each) do
        ENV[react_flag_key] = nil
      end

      it 'loads homepage successfully' do
        get :index
        expect(response).to be_ok
      end

      it 'renders in angular by default' do
        get :index
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :index, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :index, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when HOME_PAGE_REACT env var is true' do
      before(:each) do
        ENV[react_flag_key] = 'true'
      end

      it 'loads homepage successfully' do
        get :index
        expect(response).to be_ok
      end

      it 'renders in react by default' do
        get :index
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=true param passed' do
        get :index, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :index, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end

    describe 'when HOME_PAGE_REACT env var is false' do
      before(:each) do
        ENV[react_flag_key] = 'false'
      end

      it 'loads homepage successfully' do
        get :index
        expect(response).to be_ok
      end

      it 'renders in react by default' do
        get :index
        expect(response).to render_template 'layouts/application-angular'
      end

      it 'renders in react when react=true param passed' do
        get :index, params: { react: 'true' }
        expect(response).to render_template 'layouts/application-react'
      end

      it 'renders in react when react=false param passed' do
        get :index, params: { react: 'false' }
        expect(response).to render_template 'layouts/application-angular'
      end
    end
  end
end
