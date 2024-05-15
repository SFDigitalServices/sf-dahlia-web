require 'rails_helper'

RSpec.describe HomeController do
  describe '#index' do
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

    it 'renders in angular when react=false param passed' do
      get :index, params: { react: 'false' }
      expect(response).to render_template 'layouts/application-angular'
    end
  end
end
