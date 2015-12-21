Rails.application.routes.draw do
  root to: 'home#index'

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      resources :listings, only: [:index, :show]
      post 'listings-eligibility' => 'listings#eligibility'
    end
  end

  # required for Angular html5mode
  get '*path' => 'home#index'
end
