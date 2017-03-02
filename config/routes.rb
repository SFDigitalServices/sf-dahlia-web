Rails.application.routes.draw do
  root to: 'home#index'

  mount_devise_token_auth_for(
    'User',
    at: 'api/v1/auth',
    skip: %i(omniauth_callbacks),
    controllers: {
      registrations: 'overrides/registrations',
      sessions: 'overrides/sessions',
      token_validations: 'overrides/token_validations',
      confirmations: 'overrides/confirmations',
      passwords: 'overrides/passwords',
    },
  )

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      # listings
      resources :listings, only: [:index, :show] do
        member do
          get 'units'
          get 'lottery_buckets'
          get 'lottery_ranking'
          get 'preferences'
        end
        collection do
          post 'ami' => 'listings#ami'
          post 'eligibility' => 'listings#eligibility'
        end
      end
      scope '/short-form' do
        post 'validate-household' => 'short_form#validate_household'
        get 'listing-application/:listing_id' => 'short_form#show_listing_application_for_user'
        get 'application/:id' => 'short_form#show_application'
        post 'application' => 'short_form#submit_application'
        put 'application/:id' => 'short_form#update_application'
        delete 'application/:id' => 'short_form#delete_application'
        post 'proof' => 'short_form#upload_proof'
        delete 'proof' => 'short_form#delete_proof'
      end
      scope '/addresses' do
        # address validation
        post 'validate' => 'address_validation#validate'
        # address geocoding
        post 'geocode' => 'geocoding#geocode'
      end
      scope '/account' do
        get 'my-applications' => 'account#my_applications'
        put 'update' => 'account#update'
        get 'confirm' => 'account#confirm'
      end
    end
  end

  post '/addresses' => 'api/v1/address_validation#addresses'

  # sitemap generator
  get 'sitemap.xml' => 'sitemaps#generate'

  # catch all mailer preview paths
  get '/rails/mailers/*path' => 'rails/mailers#preview'
  # required for Angular html5mode
  get '*path' => 'home#index'
end
