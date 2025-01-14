# Angular UI-router setup
@dahlia.config [
  '$stateProvider',
  '$urlRouterProvider',
  '$urlMatcherFactoryProvider',
  '$locationProvider',
  ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) ->
    # allow trailing slashes and don't force case sensitivity on routes
    $urlMatcherFactoryProvider.caseInsensitive(true)
    $urlMatcherFactoryProvider.strictMode(false)

    $stateProvider
    .state('dahlia', {
      url: '/{lang:(?:en|es|tl|zh)}'
      abstract: true
      params:
        lang: { squash: true, value: 'en' }
        skipConfirm: { squash: true, value: false }
      views:
        'alert@':
          templateUrl: 'shared/templates/alert-message.html'
        'translate@':
          templateUrl: 'shared/templates/translate-bar.html'
        'version@':
          templateUrl: 'shared/templates/version.html'
        'navigation@':
          templateUrl: 'shared/templates/nav/navigation.html'
          controller: 'NavController'
        'footer@':
          templateUrl: 'shared/templates/footer.html'
      data:
        meta:
          'description': 'Search and apply for affordable housing on the City of San Francisco\'s DAHLIA Housing Portal.'
      resolve:
        translations: ['$stateParams', '$translate', ($stateParams, $translate) ->
          # this should happen after preferredLanguage is initially set
          $translate.use($stateParams.lang)
        ]
        data: ['ngMeta', 'SharedService', (ngMeta, SharedService) ->
          img = SharedService.assetPaths['dahlia_social-media-preview.jpg']
          ngMeta.setTag('og:image', img)
        ]
    })
    # Home page
    .state('dahlia.welcome', {
      url: ''
      views:
        'container@':
          templateUrl: 'pages/templates/welcome.html'
    })
    .state('dahlia.housing-counselors', {
      url: '/housing-counselors'
      views:
        'container@':
          templateUrl: 'pages/templates/housing-counselors.html',
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.housing_counselors')
        ]
        counselors: ['SharedService', (SharedService) ->
          SharedService.getHousingCounselors()
        ]
    })
    .state('dahlia.listings-for-rent', {
      url: '/listings/for-rent'
      views:
        'container@':
          templateUrl: 'listings/templates/listings-for-rent.html'
      resolve:
        listings: ['$stateParams', 'ListingDataService', ($stateParams, ListingDataService) ->
          ListingDataService.getListings({checkEligibility: true, retranslate: true, clearFilters: false, params: {type: 'rental'}})
        ]
        $title: ['$translate', ($translate) ->
          # translate used without ".instant" so that it will async resolve
          $translate('page_title.rental_listings')
        ]
    })
    .state('dahlia.listings-for-sale', {
      url: '/listings/for-sale'
      views:
        'container@':
          templateUrl: 'listings/templates/listings-for-sale.html'
      resolve:
        listings: ['$stateParams', 'ListingDataService', ($stateParams, ListingDataService) ->
          ListingDataService.getListings({checkEligibility: true, retranslate: true, clearFilters: false, params: {type: 'ownership'}})
        ]
        $title: ['$translate', ($translate) ->
          # translate used without ".instant" so that it will async resolve
          $translate('page_title.sale_listings')
        ]
    })
    .state('dahlia.listing', {
      url: '/listings/:id?preview',
      params:
        skipConfirm: { squash: true, value: false }
        timeout: { squash: true, value: false }
        preview: null
      views:
        'container@':
          templateUrl: ($stateParams) ->
            # templateUrl is a special function that only takes $stateParams
            # which is why we can't include ListingDataService here
            if _.includes(MAINTENANCE_LISTINGS, $stateParams.id)
              'listings/templates/listing-maintenance.html'
            else
              'listings/templates/listing.html'
      resolve:
        listing: [
          '$stateParams', '$state', '$q', 'ListingDataService', 'ListingLotteryService', 'ListingPreferenceService', 'ListingUnitService',
          ($stateParams, $state, $q, ListingDataService, ListingLotteryService, ListingPreferenceService, ListingUnitService) ->
            deferred = $q.defer()
            forceRecache = $stateParams.preview
            ListingDataService.getListing($stateParams.id, forceRecache, true).then( ->
              deferred.resolve(ListingDataService.listing)
              if _.isEmpty(ListingDataService.listing)
                # kick them out unless there's a real listing
                return $state.go("dahlia.redirect-home")
              if _.includes(MAINTENANCE_LISTINGS, $stateParams.id)
                return deferred.promise

              # trigger this asynchronously, allowing the listing page to load first
              ListingUnitService.getListingAMI(ListingDataService.listing).then( ->
                setTimeout(ListingUnitService.getListingUnits.bind(null, ListingDataService.listing, forceRecache))
              )
              setTimeout(ListingPreferenceService.getListingPreferences.bind(null, ListingDataService.listing, forceRecache))
              unless !ListingLotteryService.lotteryComplete(ListingDataService.listing)
                setTimeout(ListingLotteryService.getLotteryBuckets.bind(null, ListingDataService.listing, forceRecache))
              setTimeout(ListingDataService.getListingPaperAppURLs.bind(null, ListingDataService.listing))
              # be sure to reset all relevant data in ListingDataService.resetListingData() if you add to this list !
            ).catch( (response) ->
              deferred.reject(response)
            )
            return deferred.promise
        ]
        application: [
          '$stateParams', 'ShortFormApplicationService',
          ($stateParams, ShortFormApplicationService) ->
            # check if user has already applied to this listing
            ShortFormApplicationService.getMyApplicationForListing($stateParams.id)
        ]
        $title: ['$title', 'listing', ($title, listing) ->
          listing.Name
        ]
        data: ['ngMeta', 'listing', (ngMeta, listing) ->
          desc = "Apply for affordable housing at #{listing.Name} on the City of San Francisco's DAHLIA Housing Portal."
          ngMeta.setTag('description', desc)
          ngMeta.setTag('og:image', listing.imageURL)
        ]
      # https://github.com/vinaygopinath/ngMeta#using-custom-data-resolved-by-ui-router
      meta:
        disableUpdate: true
    })
    ##########################
    # < Account/Login pages >
    ##########################
    # TODO: refactor "my account" pages to be under the same namespace/controller
    ############
    .state('dahlia.create-account', {
      url: '/create-account'
      views:
        'container@':
          templateUrl: 'account/templates/create-account.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.unlockFields()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.create_account')
        ]
    })
    .state('dahlia.short-form-application.create-account', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/create-account'
      url: '/create-account'
      views:
        'container@':
          templateUrl: 'account/templates/create-account.html'
          controller: 'AccountController'
      onEnter: ['$state', 'AccountService', ($state, AccountService) ->
        reconcilingAccountDetails =
          $state.current.name == 'dahlia.short-form-application.choose-applicant-details'

        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.copyApplicantFields('applicant', { excludeEmail: reconcilingAccountDetails })

        if reconcilingAccountDetails
          AccountService.unlockFields()
        else
          AccountService.lockCompletedFields()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.create_account')
        ]
    })
    .state('dahlia.sign-in', {
      url: '/sign-in?expiredUnconfirmed&expiredConfirmed&redirectTo'
      params:
        newAccount: {squash: true}
        skipConfirm: { squash: true, value: false }
        timeout: { squash: true, value: false }
        expiredUnconfirmed: null
        expiredConfirmed: null
        redirectTo: null
        fromShortFormIntro: null
        signedOut: null
        userTokenValidationTimeout: null
      views:
        'container@':
          templateUrl: 'account/templates/sign-in.html'
          controller: 'AccountController'
      onEnter: ['$stateParams', 'AccountService', ($stateParams, AccountService) ->
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.unlockFields()

        if $stateParams.expiredUnconfirmed
          AccountService.openConfirmationExpiredModal($stateParams.expiredUnconfirmed)
        if $stateParams.expiredConfirmed
          AccountService.openConfirmationExpiredModal($stateParams.expiredConfirmed, true)
        if $stateParams.newAccount
          AccountService.openConfirmEmailModal()
        if $stateParams.timeout
          AccountService.accountError.messages.timeout = true
        if $stateParams.redirectTo
          AccountService.afterLoginRedirect($stateParams.redirectTo)
        if $stateParams.signedOut
          AccountService.afterSignOut()
        if $stateParams.userTokenValidationTimeout
          AccountService.afterUserTokenValidationTimeout()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.sign_in')
        ]
    })
    .state('dahlia.short-form-application.sign-in', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/sign-in'
      url: '/sign-in'
      views: {
        'container@': {
          controller: 'ShortFormApplicationController'
          templateUrl: 'account/templates/sign-in.html'
        }
      }
      onEnter: ['AccountService', (AccountService) ->
        # for using browser back button after signing in
        if AccountService.loggedInUser.id
          AccountService.signOut({ preserveAppData: true })
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.copyApplicantFields()
        AccountService.lockCompletedFields()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.sign_in')
        ]
    })
    .state('dahlia.forgot-password', {
      url: '/forgot-password'
      views:
        'container@':
          templateUrl: 'account/templates/forgot-password.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
      ]
    })
    .state('dahlia.continue-draft-sign-in', {
      url: '/continue-draft-sign-in/:listing_id'
      views:
        'container@':
          # use same template as usual sign-in route
          templateUrl: 'account/templates/sign-in.html'
          controller: 'AccountController'
    })
    .state('dahlia.short-form-application.forgot-password', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/forgot-password'
      url: '/forgot-password'
      views:
        'container@':
          templateUrl: 'account/templates/forgot-password.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
      ]
    })
    .state('dahlia.reset-password', {
      url: '/reset-password'
      views:
        'container@':
          templateUrl: 'account/templates/reset-password.html'
          controller: 'AccountController'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
      onEnter: ['$state', 'AccountService', ($state, AccountService) ->
        AccountService.clearAccountMessages()
        unless AccountService.loggedIn()
          return $state.go('dahlia.sign-in')
      ]
    })
    .state('dahlia.account-settings', {
      url: '/account-settings?reconfirmed'
      params:
        reconfirmed: null
      views:
        'container@':
          templateUrl: 'account/templates/account-settings.html'
          controller: 'AccountController'
      resolve:
        auth: ['$auth', 'AccountService', ($auth, AccountService) ->
          $auth.validateUser().then ->
            AccountService.copyApplicantFields('loggedInUser')
            AccountService.unlockFields()
        ]
      onEnter: ['$stateParams', 'AccountService', ($stateParams, AccountService) ->
        AccountService.clearAccountMessages()
        if $stateParams.reconfirmed
          AccountService.showReconfirmedMessage()
      ]
    })
    .state('dahlia.eligibility-settings', {
      url: '/eligibility-settings'
      views:
        'container@':
          templateUrl: 'account/templates/eligibility-settings.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    .state('dahlia.my-account', {
      url: '/my-account?accountConfirmed'
      params:
        skipConfirm:
          squash: true
        accountConfirmed: null
      views:
        'container@':
          templateUrl: 'account/templates/my-account.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
        $title: ['$translate', ($translate) ->
          $translate('page_title.my_account')
        ]
      onEnter: ['$stateParams', 'AnalyticsService', ($stateParams, AnalyticsService) ->
        if $stateParams.accountConfirmed
          AnalyticsService.trackAccountCreation()
      ]
    })
    .state('dahlia.my-applications', {
      url: '/my-applications'
      params:
        skipConfirm:
          squash: true
          value: false
        infoChanged:
          squash: true
        alreadySubmittedId:
          squash: true
        doubleSubmit:
          squash: true
      views:
        'container@':
          controller: 'AccountController'
          templateUrl: 'account/templates/my-applications.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
        myApplications: ['AccountService', (AccountService) ->
          AccountService.getMyApplications()
        ]
        $title: ['$translate', ($translate) ->
          $translate('page_title.my_applications')
        ]
      onEnter: ['$stateParams', 'AccountService', ($stateParams, AccountService) ->
        if $stateParams.infoChanged
          AccountService.openInfoChangedModal()
        if $stateParams.alreadySubmittedId
          AccountService.openAlreadySubmittedModal($stateParams.alreadySubmittedId, $stateParams.doubleSubmit)
      ]
    })
    ##########################
    # </ End Account/Login >
    ##########################
    .state('dahlia.favorites', {
      url: '/favorites'
      views:
        'container@':
          templateUrl: 'listings/templates/favorites.html'
      resolve:
        listing: ['$stateParams', 'ListingDataService', ($stateParams, ListingDataService) ->
          ListingDataService.getFavoriteListings()
        ]
        $title: ['$translate', ($translate) ->
          $translate('page_title.favorites')
        ]
    })
    .state('dahlia.disclaimer', {
      url: '/disclaimer'
      views:
        'container@':
          templateUrl: 'pages/templates/disclaimer.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.disclaimer')
        ]
    })
    .state('dahlia.privacy', {
      url: '/privacy'
      views:
        'container@':
          templateUrl: 'pages/templates/privacy.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.privacy')
        ]
    })
    .state('dahlia.share', {
      url: '/share/:id'
      views:
        'container@':
          templateUrl: 'pages/templates/share.html'
          controller: 'ShareController'
      resolve:
        $title: ['$title', '$translate', 'ListingDataService', ($title, $translate, ListingDataService) ->
          if !_.isEmpty(ListingDataService.listing)
            $translate('page_title.share_listing', {listing: ListingDataService.listing.Name})
          else
            $translate('page_title.share_listing', {listing: 'Listing'})
        ]

    })
    .state('dahlia.eligibility-estimator', {
      url: '/eligibility-estimator/:listingsType'
      views:
        'container@':
          templateUrl: 'pages/templates/eligibility-estimator.html'
          controller: 'EligibilityEstimatorController'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.eligibility_estimator')
        ]
    })
    .state('dahlia.income-calculator', {
      url: '/income-calculator/:listingsType'
      abstract: true
      views:
        'container@':
          templateUrl: 'income-calculator/templates/income-calculator.html'
          controller: 'IncomeCalculatorController'
    })
    .state('dahlia.income-calculator.intro', {
      url: '/intro'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/intro.html'
    })
    .state('dahlia.income-calculator.edit', {
      url: '/edit'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/edit.html'
    })
    .state('dahlia.income-calculator.summary', {
      url: '/summary'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/summary.html'
    })
    .state('dahlia.get-assistance',{
      url: '/get-assistance'
      views:
        'container@':
          templateUrl: 'pages/templates/get-assistance.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.get_assistance')
        ]
    })
    .state('dahlia.additional-resources',{
      url: '/additional-resources'
      views:
        'container@':
          templateUrl: 'pages/templates/additional-resources.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.additional_resources')
        ]
    })
    .state('dahlia.document-checklist',{
      url: '/document-checklist'
      params:
        section: null
      views:
        'container@':
          templateUrl: 'pages/templates/document-checklist.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('page_title.document_checklist')
        ]
    })
    ##########################
    # Short form application #
    ##########################
    ## -- Initial Welcome Pages -- ##
    .state('dahlia.short-form-welcome', {
      url: '/listings/:id/apply-welcome'
      abstract: true
      resolve:
        listing: [
          '$stateParams', '$q', 'ListingDataService',
          ($stateParams, $q, ListingDataService) ->
            # store the listing in ListingDataService and kick out if it's not open for applications
            ListingDataService.getListingAndCheckIfOpen($stateParams.id)
        ]
        $title: ['$title', '$translate', 'listing', ($title, $translate, listing) ->
          $translate('page_title.listing_application', {listing: listing.Name})
        ]
    })
    .state('dahlia.short-form-welcome.intro', {
      url: '/intro'
      views:
        'container@':
          templateUrl: 'short-form/templates/a1-intro.html'
          controller: 'ShortFormApplicationController'
    })
    .state('dahlia.short-form-welcome.community-screening', {
      url: '/community-screening'
      params:
        skipConfirm: { squash: true, value: false }
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
        'container@dahlia.short-form-welcome.community-screening':
          templateUrl: 'short-form/templates/a2-community-screening.html'
    })
    .state('dahlia.short-form-welcome.custom-educator-screening', {
      url: '/custom-educator-screening'
      params:
        skipConfirm: { squash: true, value: false }
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
        'container@dahlia.short-form-welcome.custom-educator-screening':
          templateUrl: 'short-form/templates/a3-custom-educator-screening.html'
    })
    .state('dahlia.short-form-welcome.overview', {
      url: '/overview'
      views:
        'container@':
          templateUrl: 'short-form/templates/a4-overview.html'
          controller: 'ShortFormApplicationController'
    })
    ## -- Short Form Application pages -- ##
    .state('dahlia.short-form-application', {
      url: '/listings/:id/apply'
      abstract: true
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
      resolve:
        listing: [
          '$state', '$stateParams', '$q', 'ListingDataService', 'ListingPreferenceService',
          ($state, $stateParams, $q, ListingDataService, ListingPreferenceService) ->
            # store the listing in ListingDataService and kick out if it's not open for applications
            deferred = $q.defer()
            ListingDataService.getListingAndCheckIfOpen($stateParams.id).then( ->
              ListingPreferenceService.getListingPreferences(ListingDataService.listing).then ->
                deferred.resolve(ListingDataService.listing)
            ).catch( (response) ->
              # if no listing info is found, treat this as a 404 and redirect to homepage
              $state.go('dahlia.redirect-home') unless ListingDataService.listing
              deferred.reject(response)
            )
            return deferred.promise
        ]
        application: [
          # 'listing' is part of the params so that application waits for listing (above) to resolve
          '$q', '$stateParams', '$state', 'ShortFormApplicationService', 'AccountService', 'AutosaveService', 'AnalyticsService', 'listing'
          ($q, $stateParams, $state, ShortFormApplicationService, AccountService, AutosaveService, AnalyticsService, listing) ->
            deferred = $q.defer()

            # if the user just clicked the language switcher, don't reload the whole route
            if ShortFormApplicationService.switchingLanguage()
              deferred.resolve(ShortFormApplicationService.application)
              return deferred.promise

            # always refresh the anonymous session_uid when starting a new application
            ShortFormApplicationService.refreshSessionUid()

            # if we have an autofilled application that means we're just trying to get to the preview page
            if ShortFormApplicationService.application.autofill
              deferred.resolve(ShortFormApplicationService.application)
              return deferred.promise

            # it's ok if user is not logged in, we always check if they have an application
            # this is because "loggedIn()" may not return true on initial load
            ShortFormApplicationService.getMyApplicationForListing($stateParams.id, {autofill: true}).then( ->
              if AccountService.loggedIn()
                AutosaveService.startTimer()

              deferred.resolve(ShortFormApplicationService.application)
              lang = ShortFormApplicationService.getLanguageCode(ShortFormApplicationService.application)

              if ShortFormApplicationService.application.status == 'Submitted'
                # send them to their review page if the application is already submitted
                # user id should always be present, but we are being cautious
                AnalyticsService.trackApplicationAbandon(listing.Id, AccountService.loggedInUser?.id, "Application already submitted")
                $state.go('dahlia.short-form-review', {id: ShortFormApplicationService.application.id})
              else if ShortFormApplicationService.application.autofill == true
                $state.go('dahlia.short-form-application.autofill-preview', {id: listing.Id, lang: $stateParams.lang})
              else if lang && lang != $stateParams.lang
                # check if draft application language matches the lang set in the route, if not then redirect
                $state.go('dahlia.short-form-application.name', { id: $stateParams.id, lang: lang })
              # check if community screening has been answered
              if listing.Reserved_community_type &&
                ShortFormApplicationService.application.answeredCommunityScreening != 'Yes'
                  $state.go('dahlia.short-form-welcome.community-screening', {id: listing.Id, skipConfirm: true, lang: lang})
              # check if educator screening has been answered
              if ShortFormApplicationService.listingIsEducator() &&
                !ShortFormApplicationService.application.customEducatorScreeningAnswer
                  $state.go('dahlia.short-form-welcome.custom-educator-screening', {id: listing.Id, skipConfirm: true, lang: lang})
            ).catch( (response) ->
              # Verify source of errors in https://www.pivotaltracker.com/story/show/159802520
              console.error('Error getting my application for listing (angularRoutes, application)', $stateParams.id)
              deferred.reject(response)
            )
            return deferred.promise
        ]
        $title: ['$title', '$translate', 'listing', ($title, $translate, listing) ->
          $translate('page_title.listing_application', {listing: listing.Name})
        ]
    })
    .state('dahlia.short-form-application.dalp-screening', {
      url: '/dalp-screening'
      params:
        skipConfirm: { squash: true, value: false }
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
        'container@dahlia.short-form-application.dalp-screening':
          templateUrl: 'short-form/templates/a4a-dalp-screening.html'
    })
    # Short form: "You" section
    .state('dahlia.short-form-application.prerequisites', {
      url: '/prerequisites'
      views:
        'container':
          templateUrl: 'short-form/templates/b0a-prerequisites.html'
      params:
        infoChanged:
          squash: true
      onEnter: [
        '$state', '$stateParams', 'ShortFormApplicationService', 'AccountService', 'AutosaveService'
        ($state, $stateParams, ShortFormApplicationService, AccountService, AutosaveService) ->
          if ShortFormApplicationService.listingIsDalp() && !ShortFormApplicationService.application.answeredDalpScreening
            $state.go('dahlia.short-form-application.dalp-screening', {id: $stateParams.id, skipConfirm: true, lang: $stateParams.lang})
          # If applicant tries to go to this page on a rental listing, redirect them back to homepage
          if !ShortFormApplicationService.listingIsSale()
            $state.go('dahlia.welcome')
          ShortFormApplicationService.completeSection('Intro')
          if AccountService.loggedIn()
            ShortFormApplicationService.importUserData(AccountService.loggedInUser)
            ShortFormApplicationService.infoChanged = $stateParams.infoChanged
      ]
      resolve:
        lendingInstitutions: ['LendingInstitutionService', (LendingInstitutionService) ->
          LendingInstitutionService.getLendingInstitutions()
        ]
    })
    .state('dahlia.short-form-application.autofill-preview', {
      url: '/autofill-preview'
      views:
        'container':
          templateUrl: 'short-form/templates/b0-autofill-preview.html'
      resolve:
        # autofill-preview requires you to be logged in
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
        autofill: [
          'application', '$timeout', '$state', '$stateParams',
          (application, $timeout, $state, $stateParams) ->
            # this is to handle the case where you opted out of autofill
            # and then clicked 'back' in the browser from short form
            $timeout ->
              # autofill would not be `true` if you opted out
              unless application && application.autofill
                $state.go('dahlia.short-form-welcome.overview', { id: $stateParams.id })
            , 0, false
        ]
      onEnter: [
        'ShortFormApplicationService', 'AccountService',
        (ShortFormApplicationService, AccountService) ->
          ShortFormApplicationService.completeSection('Intro')
          if AccountService.loggedIn()
            ShortFormApplicationService.importUserData(AccountService.loggedInUser)
      ]
    })
    .state('dahlia.short-form-application.name', {
      url: '/name'
      views:
        'container':
          templateUrl: 'short-form/templates/b1-name.html'
      params:
        infoChanged:
          squash: true
      onEnter: [
        '$stateParams', 'ShortFormApplicationService', 'AccountService', 'AutosaveService',
        ($stateParams, ShortFormApplicationService, AccountService, AutosaveService) ->
          if ShortFormApplicationService.listingIsSale()
            ShortFormApplicationService.completeSection('Qualify')
          else
            ShortFormApplicationService.completeSection('Intro')
          if AccountService.loggedIn()
            ShortFormApplicationService.importUserData(AccountService.loggedInUser)
            ShortFormApplicationService.infoChanged = $stateParams.infoChanged
            # always autosave when you start a new application
            # TODO: remove hotfix for marking initial autosaves that come from the Name page
            unless ShortFormApplicationService.application.id
              ShortFormApplicationService.submitApplication({autosave: true, initialSave: true})
      ]
    })
    .state('dahlia.short-form-application.welcome-back', {
      url: '/welcome-back'
      views:
        'container':
          templateUrl: 'short-form/templates/b1a-welcome-back.html'
      onEnter: [
        '$state', 'ShortFormApplicationService', 'AccountService',
        ($state, ShortFormApplicationService, AccountService) ->
          # for using browser back button after signing in
          if AccountService.loggedInUser.id
            AccountService.signOut({ preserveAppData: true })
            ShortFormApplicationService.resetApplicationData({
              applicant: ShortFormApplicationService.application.overwrittenApplicantInfo
            })

          AccountService.clearAccountMessages()
          AccountService.resetUserAuth()
          AccountService.copyApplicantFields()
          AccountService.lockCompletedFields()
      ]
    })
    .state('dahlia.short-form-application.contact', {
      url: '/contact'
      views:
        'container':
          templateUrl: 'short-form/templates/b2-contact.html'
    })
    .state('dahlia.short-form-application.verify-address', {
      url: '/verify-address'
      views:
        'container':
          templateUrl: 'short-form/templates/b2a-verify-address.html'
    })
    .state('dahlia.short-form-application.alternate-contact-type', {
      url: '/alternate-contact-type'
      views:
        'container':
          templateUrl: 'short-form/templates/b3-alternate-contact-type.html'
    })
    .state('dahlia.short-form-application.alternate-contact-name', {
      url: '/alternate-contact-name'
      views:
        'container':
          templateUrl: 'short-form/templates/b4-alternate-contact-name.html'
    })
    .state('dahlia.short-form-application.alternate-contact-phone-address', {
      url: '/alternate-contact-phone-address'
      views:
        'container':
          templateUrl: 'short-form/templates/b4a-alternate-contact-phone-address.html'
    })
    # Short form: "Household" section
    .state('dahlia.short-form-application.household-intro', {
      url: '/household-intro'
      views:
        'container':
          templateUrl: 'short-form/templates/c1-household-intro.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('You')
        ]
    })
    .state('dahlia.short-form-application.household-overview', {
      url: '/household-overview'
      views:
        'container':
          templateUrl: 'short-form/templates/c1a-household-overview.html'
    })
    .state('dahlia.short-form-application.household-members', {
      url: '/household-members'
      views:
        'container':
          templateUrl: 'short-form/templates/c2-household-members.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('You')
        ]
    })
    .state('dahlia.short-form-application.household-member-form', {
      url: '/household-member-form'
      views:
        'container':
          templateUrl: 'short-form/templates/c3-household-member-form.html'
      resolve:
        householdMember: [
          'ShortFormApplicationService',
          (ShortFormApplicationService) ->
            ShortFormApplicationService.resetHouseholdMember()
        ]
    })
    .state('dahlia.short-form-application.household-member-form-edit', {
      url: '/household-member-form/:member_id'
      views:
        'container':
          templateUrl: 'short-form/templates/c3-household-member-form.html'
      resolve:
        householdMember: [
          '$stateParams',
          'ShortFormApplicationService',
          ($stateParams, ShortFormApplicationService) ->
            ShortFormApplicationService.getHouseholdMember($stateParams.member_id)
        ]
    })
    .state('dahlia.short-form-application.household-member-verify-address', {
      url: '/household-member-verify-address/:member_id'
      views:
        'container':
          templateUrl: 'short-form/templates/c3a-household-member-verify-address.html'
    })
    .state('dahlia.short-form-application.household-public-housing', {
      url: '/household-public-housing'
      views:
        'container':
          templateUrl: 'short-form/templates/c4-household-public-housing.html'
    })
    .state('dahlia.short-form-application.household-monthly-rent', {
      url: '/household-monthly-rent'
      views:
        'container':
          templateUrl: 'short-form/templates/c5-household-monthly-rent.html'
      onEnter: [
        'ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.groupHouseholdAddresses()
      ]
    })
    .state('dahlia.short-form-application.household-reserved-units-veteran', {
      url: '/household-reserved-units-veteran'
      views:
        'container':
          templateUrl: 'short-form/templates/c6a-household-reserved-units-veteran.html'
    })
    .state('dahlia.short-form-application.household-reserved-units-disabled', {
      url: '/household-reserved-units-disabled'
      views:
        'container':
          templateUrl: 'short-form/templates/c6b-household-reserved-units-disabled.html'
    })
    .state('dahlia.short-form-application.household-priorities', {
      url: '/household-priorities'
      views:
        'container':
          templateUrl: 'short-form/templates/c7-household-priorities.html'
    })
    .state('dahlia.short-form-application.home-and-community-based-services', {
      url: '/home-and-community-based-services'
      views:
        'container':
          templateUrl: 'short-form/templates/c8-home-and-community-based-services.html'
    })
    # Short form: "Income" section
    .state('dahlia.short-form-application.income-vouchers', {
      url: '/income-vouchers'
      views:
        'container':
          templateUrl: 'short-form/templates/d1-income-vouchers.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Household')
        ]
    })
    .state('dahlia.short-form-application.income', {
      url: '/income'
      views:
        'container':
          templateUrl: 'short-form/templates/d2-income-household.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Household')
        ]
    })
    # Short form: "Preferences" section
    .state('dahlia.short-form-application.preferences-intro', {
      url: '/preferences-intro'
      views:
        'container':
          templateUrl: 'short-form/templates/e1-preferences-intro.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.neighborhood-preference', {
      url: '/neighborhood-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e2a-neighborhood-preference.html'
      onEnter: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType('neighborhoodResidence')
      ],
      onExit: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType(null)
      ]
    })
    .state('dahlia.short-form-application.adhp-preference', {
      url: '/adhp-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e2b-adhp-preference.html'
      onEnter: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType('antiDisplacement')
      ],
      onExit: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType(null)
      ]
    })
    .state('dahlia.short-form-application.live-work-preference', {
      url: '/live-work-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e2c-live-work-preference.html'
      onEnter: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType('liveWorkInSf')
      ],
      onExit: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType(null)
      ]
    })
    .state('dahlia.short-form-application.assisted-housing-preference', {
      url: '/assisted-housing-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e3a-assisted-housing-preference.html'
      onEnter: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType('assistedHousing')
      ],
      onExit: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType(null)
      ]
    })
    .state('dahlia.short-form-application.rent-burdened-preference', {
      url: '/rent-burdened-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e3b-rent-burdened-preference.html'
      onEnter: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType('rentBurden')
      ],
      onExit: ['ShortFormApplicationService', (ShortFormApplicationService) ->
        ShortFormApplicationService.setFormPreferenceType(null)
      ]
    })
    .state('dahlia.short-form-application.rent-burdened-preference-edit', {
      url: '/rent-burdened-preference/:index'
      views:
        'container':
          templateUrl: 'short-form/templates/e3b-rent-burdened-preference-edit.html'
      resolve:
        addressIndex: [
          '$stateParams', 'ShortFormApplicationService',
          ($stateParams, ShortFormApplicationService) ->
            ShortFormApplicationService.setRentBurdenAddressIndex($stateParams.index)
        ]
    })
    .state('dahlia.short-form-application.right-to-return-preference', {
      url: '/right-to-return-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e6a-right-to-return-preference.html'
    })
    .state('dahlia.short-form-application.alice-griffith-verify-address', {
      url: '/alice-griffith-verify-address'
      views: {
        container: {
          templateUrl: 'short-form/templates/e6b-alice-griffith-verify-address.html'
        }
      }
    })
    .state('dahlia.short-form-application.preferences-programs', {
      url: '/preferences-programs'
      views:
        'container':
          templateUrl: 'short-form/templates/e7-preferences-programs.html'
    })
    .state('dahlia.short-form-application.veterans-preference', {
      url: '/veterans-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e7a-veterans-preference.html'
    })
    .state('dahlia.short-form-application.custom-preferences', {
      url: '/custom-preferences'
      views:
        'container':
          templateUrl: 'short-form/templates/e7b-custom-preferences.html'
    })
    .state('dahlia.short-form-application.custom-proof-preferences', {
      url: '/custom-proof-preferences/:prefIdx'
      views:
        'container':
          templateUrl: 'short-form/templates/e7c-custom-proof-preferences.html'
      onEnter: [
        '$stateParams', 'ShortFormApplicationService',
        ($stateParams, ShortFormApplicationService) ->
          customPref = ShortFormApplicationService.listing.customProofPreferences[$stateParams.prefIdx]
          angular.copy(customPref, ShortFormApplicationService.currentCustomProofPreference)
        ]
    })
    .state('dahlia.short-form-application.general-lottery-notice', {
      url: '/general-lottery-notice'
      views:
        'container':
          templateUrl: 'short-form/templates/e8-general-lottery-notice.html'
    })
    # Short form: "Review" section
    .state('dahlia.short-form-application.review-optional', {
      url: '/review-optional'
      views:
        'container':
          templateUrl: 'short-form/templates/f0-review-optional.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Preferences')
        ]
    })
    .state('dahlia.short-form-application.review-summary', {
      url: '/review-summary'
      views:
        'container':
          templateUrl: 'short-form/templates/f1-review-summary.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Preferences')
          ShortFormApplicationService.checkForProofPrefs()
        ]
    })
    .state('dahlia.short-form-application.review-terms', {
      url: '/review-terms?loginMessage'
      params:
        loginMessage: { squash: true }
      views:
        'container':
          templateUrl: 'short-form/templates/f2-review-terms.html'
    })
    .state('dahlia.short-form-application.confirmation', {
      url: '/confirmation'
      views:
        'container':
          templateUrl: 'short-form/templates/g1-confirmation.html'
      onEnter: [
        'listing', 'ShortFormNavigationService',
        (listing, ShortFormNavigationService) ->
          ShortFormNavigationService.redirectIfNoApplication(listing)
      ]
    })
    .state('dahlia.short-form-application.review-submitted', {
      url: '/review-submitted'
      views:
        'container@':
          templateUrl: 'short-form/templates/review-application.html'
          controller: 'ShortFormApplicationController'
      onEnter: [
        'listing', 'ShortFormNavigationService',
        (listing, ShortFormNavigationService) ->
          ShortFormNavigationService.redirectIfNoApplication(listing)
      ]
    })
    # Short form submission: Review
    .state('dahlia.short-form-review', {
      url: '/applications/:id'
      views:
        'container@':
          templateUrl: 'short-form/templates/review-application.html'
          controller: 'ShortFormApplicationController'
      resolve:
        application: [
          '$stateParams', '$state', '$q', 'ShortFormApplicationService',
          ($stateParams, $state, $q, ShortFormApplicationService) ->
            deferred = $q.defer()
            ShortFormApplicationService.getApplication($stateParams.id).then( ->
              if !ShortFormApplicationService.applicationWasSubmitted()
                $state.go('dahlia.my-applications')
              deferred.resolve(ShortFormApplicationService.application)
            ).catch( (response) ->
              deferred.reject(response)
            )
            return deferred.promise
        ]
        $title: [
          '$title', '$translate', 'application',
          ($title, $translate, application) ->
            $translate('page_title.listing_application', {listing: application.listing.Name})
        ]
    })
    .state('dahlia.short-form-application.continue-previous-draft', {
      url: '/continue-previous-draft'
      views:
        'container@':
          templateUrl: 'short-form/templates/continue-previous-draft.html'
          controller: 'ShortFormApplicationController'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
      onEnter: [
        '$state', 'ShortFormApplicationService',
        ($state, ShortFormApplicationService) ->
          if _.isEmpty(ShortFormApplicationService.accountApplication)
            $state.go('dahlia.my-applications')
        ]
    })
    .state('dahlia.short-form-application.choose-draft', {
      url: '/choose-draft'
      views:
        'container@':
          templateUrl: 'short-form/templates/choose-draft.html'
          controller: 'ShortFormApplicationController'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
      onEnter: [
        '$state', 'ShortFormApplicationService',
        ($state, ShortFormApplicationService) ->
          if _.isEmpty(ShortFormApplicationService.accountApplication)
            $state.go('dahlia.my-applications')
        ]
    })
    .state('dahlia.short-form-application.choose-applicant-details', {
      url: '/choose-applicant-details'
      views:
        'container@':
          templateUrl: 'short-form/templates/choose-applicant-details.html'
          controller: 'ShortFormApplicationController'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    .state('dahlia.redirect-home', {
      # actual redirect occurs in onStateChangeStart in angularInitialize.js
      url: '/redirect-home'
      views:
        'container@':
          templateUrl: 'pages/templates/blank.html'
    })

    $urlRouterProvider.otherwise(($injector, $location) ->
      $state = $injector.get('$state')
      $state.go("dahlia.redirect-home")
    ) # default to welcome screen

    # have to check if browser supports html5mode (http://stackoverflow.com/a/22771095)
    if !!(window.history && history.pushState)
      $locationProvider.html5Mode({enabled: true, requireBase: false})
]
