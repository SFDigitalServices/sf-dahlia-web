Rails.application.routes.draw do
  root to: 'home#index'

  mount_devise_token_auth_for 'User',
                              at: 'api/v1/auth', skip: [:omniauth_callbacks],
                              controllers: {
                                registrations:  'overrides/registrations',
                              }

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      # listings
      resources :listings, only: [:index, :show] do
        member do
          get 'units'
          get 'lottery_results'
          get 'lottery_buckets'
          get 'lottery_ranking'
        end
        collection do
          get 'ami' => 'listings#ami'
          get 'lottery-preferences' => 'listings#lottery_preferences'
          post 'eligibility' => 'listings#eligibility'
        end
      end
      scope '/short-form' do
        post 'validate-household' => 'short_form#validate_household'
        post 'submit-application' => 'short_form#submit_application'
        post 'proof' => 'short_form#upload_proof'
        delete 'proof' => 'short_form#delete_proof'
      end
      scope '/addresses' do
        # address validation
        post 'validate' => 'address_validation#validate'
        # address geocoding
        post 'geocode' => 'geocoding#geocode'
      end
    end
  end

  # catch all mailer preview paths
  get '/rails/mailers/*path' => 'rails/mailers#preview'
  # required for Angular html5mode
  get '*path' => 'home#index'
end
