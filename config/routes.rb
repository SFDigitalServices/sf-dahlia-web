Rails.application.routes.draw do
  root to: 'home#index'

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      resources :listings, only: [:index]
    end
  end
end
