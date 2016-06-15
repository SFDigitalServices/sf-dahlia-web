Rails.application.routes.draw do
  root to: 'home#index'

  mount_devise_token_auth_for 'User',
                              at: 'api/v1/auth', skip: [:omniauth_callbacks]

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      # listings
      resources :listings, only: [:index, :show] do
        member do
          get 'units'
          get 'lottery_results'
        end
      end
      get 'ami' => 'listings#ami'
      get 'lottery-preferences' => 'listings#lottery_preferences'
      post 'listings-eligibility' => 'listings#eligibility'

      # address validation
      post 'validate-address' => 'address_validation#validate'
    end
  end

  # required for Angular html5mode
  get '*path' => 'home#index'
end
