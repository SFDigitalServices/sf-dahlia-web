# Constrain class that rejects production request
class RestrictProduction
  def matches?(_)
    !Rails.env.production?
  end
end

# Constraint for visiting (:lang)/listings/:id/how-to-apply
class HowToApplyConstraint
  def matches?(request)
    # if the FCFS feature flag is enabled
    listing_id = request.params['id']
    listing = Force::ListingService.listing(listing_id)
    return true if fcfs_flag_enabled &&
                   listing_type_fcfs_sales_bmr(listing) &&
                   listing_active(listing)
  end

  def fcfs_flag_enabled
    Rails.configuration.unleash.is_enabled? 'FCFS'
  end

  def listing_type_fcfs_sales_bmr(listing)
    # Record Type has to be Ownership
    # Listing Type has to be First Come, First Served
    listing['RecordType']['Name'] == 'Ownership' &&
      listing['Listing_Type'] == 'First Come, First Served'
  end

  def listing_active(listing)
    # Status has to be Active
    # TODO: DAH-2846 Status will be added to the listing object
    # Until then, that field will be nil
    (!listing['Status'].nil? && listing['Status'] == 'Active') ||
      # Accepting Online Applications has to be true
      listing['Accepting_Online_Applications'] == true
  end
end

Rails.application.routes.draw do
  root to: 'home#index', constraints: ->(req) { req.format == :html || req.format == '*/*' }
  mount_devise_token_auth_for(
    'User',
    at: 'api/v1/auth',
    skip: %i[omniauth_callbacks],
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
      resources :listings, only: %i[index show] do
        member do
          get 'units'
          get 'lottery_buckets'
          get 'lottery_ranking'
          get 'preferences'
          get 'listingPricingTable'
        end
        collection do
          get 'ami' => 'listings#ami'
          get 'eligibility' => 'listings#eligibility'
        end
      end
      get 'trk' => 'listing_interest#index'
      scope '/short-form' do
        post 'validate-household' => 'short_form#validate_household'
        get 'listing-application/:listing_id' => 'short_form#show_listing_application_for_user'
        get 'application/:id' => 'short_form#show_application'
        post 'application' => 'short_form#submit_application'
        get 'application/:id/files' => 'short_form#files', constraints: RestrictProduction.new
        put 'application/:id' => 'short_form#update_application'
        put 'claim-application/:id' => 'short_form#claim_submitted_application'
        delete 'application/:id' => 'short_form#delete_application'
        post 'proof' => 'short_form#upload_proof'
        delete 'proof' => 'short_form#delete_proof'
        get 'lending_institutions' => 'short_form#lending_institutions'
      end
      scope '/addresses' do
        # address validation
        post 'validate' => 'address_validation#validate'
        # address geocoding
        post 'gis-data' => 'gis#gis_data'
      end
      scope '/account' do
        get 'my-applications' => 'account#my_applications'
        put 'update' => 'account#update'
        get 'confirm' => 'account#confirm'
        get 'check-account' => 'account#check_account'
      end
    end
  end

  # sitemap generator
  get 'sitemap.xml' => 'sitemaps#generate'

  # robots.txt
  get 'robots.txt' => 'robots_txts#show', format: 'text'

  # catch all mailer preview paths
  get '/rails/mailers/*path' => 'rails/mailers#preview'

  # Redirect translations file requests to new location
  get '/translations/:locale.json', to: 'application#asset_redirect'

  # React routes each use their own controllers (currently there's just one for the homepage)
  get '(:lang)' => 'home#index', lang: /(en|es|zh|tl)/

  get '(:lang)/listings/for-rent' => 'directory#rent', lang: /(en|es|zh|tl)/
  get '(:lang)/listings/for-sale' => 'directory#sale', lang: /(en|es|zh|tl)/
  # TODO: Paths on Bloom needs to be configurable
  get '(:lang)/listings/:id' => 'listing#index', lang: /(en|es|zh|tl)/

  # If the constraint doesn't pass, it falls back to the next match
  get '(:lang)/listings/:id/how-to-apply' => 'listing#how_to_apply', lang: /(en|es|zh|tl)/, constraints: HowToApplyConstraint.new
  get '(:lang)/listings/:id/how-to-apply', to: redirect('%{lang}/listings/%{id}')

  get '(:lang)/sign-in' => 'auth#sign_in', lang: /(en|es|zh|tl)/
  get '(:lang)/create-account' => 'auth#create_account', lang: /(en|es|zh|tl)/
  get '(:lang)/forgot-password' => 'auth#forgot_password', lang: /(en|es|zh|tl)/
  get '(:lang)/reset-password' => 'auth#reset_password', lang: /(en|es|zh|tl)/

  get '(:lang)/housing-counselors' => 'assistance#housing_counselors', lang: /(en|es|zh|tl)/
  get '(:lang)/get-assistance' => 'assistance#get_assistance', lang: /(en|es|zh|tl)/
  get '(:lang)/document-checklist' => 'assistance#document_checklist', lang: /(en|es|zh|tl)/
  get '(:lang)/additional-resources' => 'assistance#additional_resources', lang: /(en|es|zh|tl)/
  get '(:lang)/privacy' => 'assistance#privacy', lang: /(en|es|zh|tl)/
  get '(:lang)/disclaimer' => 'assistance#disclaimer', lang: /(en|es|zh|tl)/

  get '(:lang)/listing_interest' => 'listing_interest_page#index', lang: /(en|es|zh|tl)/

  get '(:lang)/my-account' => 'account#my_account', lang: /(en|es|zh|tl)/
  get '(:lang)/account-settings' => 'account#account_settings', lang: /(en|es|zh|tl)/
  get '(:lang)/my-applications' => 'account#my_applications', lang: /(en|es|zh|tl)/

  # fallback to Angular-only controller for all un-migrated pages.
  get '*path', to: 'angular#index', constraints: ->(req) { req.format == :html || req.format == '*/*' }
end
