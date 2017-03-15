# Angular UI-router setup
@dahlia.config [
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider) ->
    $stateProvider
    .state('dahlia', {
      url: '/{lang:(?:en|es|tl|zh)}'
      abstract: true
      params:
        lang: { squash: true, value: 'en' }
      views:
        'translate@':
          templateUrl: 'shared/templates/translate.html'
        'version@':
          templateUrl: 'shared/templates/version.html'
        'navigation@':
          templateUrl: 'shared/templates/nav/navigation.html'
          controller: 'NavController'
        'footer@':
          templateUrl: 'shared/templates/footer.html'
      resolve:
        translations: ['$stateParams', '$translate', ($stateParams, $translate) ->
          # this should happen after preferredLanguage is initially set
          $translate.use($stateParams.lang)
        ]
    })
    .state('dahlia.housing-counselors', {
      url: '/housing-counselors'
      views:
        'container@':
          templateUrl: 'pages/templates/housing-counselors.html',
          controller: 'HousingCounselorsController'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.HOUSING_COUNSELORS')
        ]
    })
    .state('dahlia.listings', {
      url: '/listings'
      views:
        'container@':
          templateUrl: 'listings/templates/listings.html'
          controller: 'ListingController'
      resolve:
        listings: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListings({checkEligibility: true})
        ]
        $title: ['$translate', ($translate) ->
          # translate used without ".instant" so that it will async resolve
          $translate('PAGE_TITLE.LISTINGS')
        ]
    })
    .state('dahlia.listing', {
      url: '/listings/:id',
      params:
        skipConfirm: { squash: true, value: false }
        timeout: { squash: true, value: false }
      views:
        'container@':
          templateUrl: 'listings/templates/listing.html'
          controller: 'ListingController'
      resolve:
        listing: [
          '$stateParams', '$state', '$q', 'ListingService',
          ($stateParams, $state, $q, ListingService) ->
            deferred = $q.defer()
            ListingService.getListing($stateParams.id).then ->
              deferred.resolve(ListingService.listing)
              if _.isEmpty(ListingService.listing)
                # kick them out unless there's a real listing
                return $state.go('dahlia.welcome')

              # trigger this asynchronously, allowing the listing page to load first
              setTimeout(ListingService.getListingAMI)
              setTimeout(ListingService.getListingUnits)
              setTimeout(ListingService.getListingPreferences)
              setTimeout(ListingService.getLotteryBuckets)
              setTimeout(ListingService.getListingDownloadURLs)
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
          $translate('PAGE_TITLE.CREATE_ACCOUNT')
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
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.copyApplicantFields()
        AccountService.lockCompletedFields()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.CREATE_ACCOUNT')
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
        if $stateParams.redirectTo
          AccountService.afterLoginRedirect($stateParams.redirectTo)
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.SIGN_IN')
        ]
    })
    .state('dahlia.short-form-application.sign-in', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/sign-in'
      url: '/sign-in'
      views:
        'container@':
          templateUrl: 'account/templates/sign-in.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.copyApplicantFields()
        AccountService.lockCompletedFields()
      ]
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.SIGN_IN')
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
      url: '/my-account'
      params:
        skipConfirm:
          squash: true
      views:
        'container@':
          templateUrl: 'account/templates/my-account.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
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
      onEnter: ['$stateParams', 'AccountService', ($stateParams, AccountService) ->
        if $stateParams.infoChanged
          AccountService.openInfoChangedModal()
        if $stateParams.alreadySubmittedId
          AccountService.openAlreadySubmittedModal($stateParams.alreadySubmittedId, $stateParams.doubleSubmit)
      ]
    })
    .state('dahlia.my-favorites', {
      url: '/my-favorites'
      views:
        'container@':
          templateUrl: 'account/templates/my-favorites.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.FAVORITES')
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
          controller: 'ListingController'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getFavoriteListings()
        ]
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.FAVORITES')
        ]
    })
    .state('dahlia.welcome', {
      url: '/'
      views:
        'container@':
          controller: 'ListingController'
          templateUrl: 'pages/templates/welcome.html'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListings({checkEligibility: false})
        ]
    })
    .state('dahlia.welcome-chinese', {
      url: '/welcome-chinese'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-chinese.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.WELCOME_CHINESE')
        ]
    })
    .state('dahlia.welcome-spanish', {
      url: '/welcome-spanish'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-spanish.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.WELCOME_SPANISH')
        ]
    })
    .state('dahlia.welcome-filipino', {
      url: '/welcome-filipino'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-filipino.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.WELCOME_FILIPINO')
        ]
    })
    .state('dahlia.disclaimer', {
      url: '/disclaimer'
      views:
        'container@':
          templateUrl: 'pages/templates/disclaimer.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.DISCLAIMER')
        ]
    })
    .state('dahlia.privacy', {
      url: '/privacy'
      views:
        'container@':
          templateUrl: 'pages/templates/privacy.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.PRIVACY')
        ]
    })
    .state('dahlia.share', {
      url: '/share/:id'
      views:
        'container@':
          templateUrl: 'pages/templates/share.html'
          controller: 'ShareController'
      resolve:
        $title: ['$title', '$translate', 'ListingService', ($title, $translate, ListingService) ->
          if !_.isEmpty(ListingService.listing)
            $translate('PAGE_TITLE.SHARE_LISTING', {listing: ListingService.listing.Name})
          else
            $translate('PAGE_TITLE.SHARE_LISTING', {listing: 'Listing'})
        ]

    })
    .state('dahlia.eligibility-estimator', {
      url: '/eligibility-estimator'
      views:
        'container@':
          templateUrl: 'pages/templates/eligibility-estimator.html'
          controller: 'EligibilityEstimatorController'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.ELIGIBILITY_ESTIMATOR')
        ]
    })
    .state('dahlia.income-calculator', {
      url: '/income-calculator'
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
          $translate('PAGE_TITLE.GET_ASSISTANCE')
        ]
    })
    .state('dahlia.additional-resources',{
      url: '/additional-resources'
      views:
        'container@':
          templateUrl: 'pages/templates/additional-resources.html'
      resolve:
        $title: ['$translate', ($translate) ->
          $translate('PAGE_TITLE.ADDITIONAL_RESOURCES')
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
          '$stateParams', 'ListingService',
          ($stateParams, ListingService) ->
            # store the listing in ListingService and kick out if it's not open for applications
            ListingService.getListingAndCheckIfOpen($stateParams.id)
        ]
    })
    .state('dahlia.short-form-welcome.intro', {
      url: '/intro'
      views:
        'container@':
          templateUrl: 'short-form/templates/a1-intro.html'
          controller: 'ShortFormApplicationController'
    })
    .state('dahlia.short-form-welcome.overview', {
      url: '/overview'
      views:
        'container@':
          templateUrl: 'short-form/templates/a2-overview.html'
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
          '$stateParams', 'ListingService',
          ($stateParams, ListingService) ->
            # store the listing in ListingService and kick out if it's not open for applications
            ListingService.getListingAndCheckIfOpen($stateParams.id).then( ->
              ListingService.getListingPreferences()
            )
        ]
        application: [
          '$stateParams', '$state', 'ShortFormApplicationService',
          ($stateParams, $state, ShortFormApplicationService) ->
            # always refresh the anonymous session_uid when starting a new application
            ShortFormApplicationService.refreshSessionUid()
            # it's ok if user is not logged in, we always check if they have an application
            # this is because "loggedIn()" may not return true on initial load
            ShortFormApplicationService.getMyApplicationForListing($stateParams.id).then ->
              if ShortFormApplicationService.application.status == 'Submitted'
                # send them to their review page if the application is already submitted
                $state.go('dahlia.short-form-review', {id: ShortFormApplicationService.application.id})
        ]
    })
    # Short form: "You" section
    .state('dahlia.short-form-application.name', {
      url: '/name'
      views:
        'container':
          templateUrl: 'short-form/templates/b1-name.html'
      onEnter: [
        'ShortFormApplicationService', 'AccountService',
        (ShortFormApplicationService, AccountService) ->
          ShortFormApplicationService.completeSection('Intro')
          if AccountService.loggedIn()
            ShortFormApplicationService.importUserData(AccountService.loggedInUser)
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
    })
    # Short form: "Preferences" section
    .state('dahlia.short-form-application.preferences-intro', {
      url: '/preferences-intro'
      views:
        'container':
          templateUrl: 'short-form/templates/e0-preferences-intro.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.preferences-programs', {
      url: '/preferences-programs'
      views:
        'container':
          templateUrl: 'short-form/templates/e1-preferences-programs.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.live-work-preference', {
      url: '/live-work-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/e2-live-work-preference.html'
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
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.general-lottery-notice', {
      url: '/general-lottery-notice'
      views:
        'container':
          templateUrl: 'short-form/templates/e2f-general-lottery-notice.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
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
        ]
    })
    .state('dahlia.short-form-application.review-sign-in', {
      url: '/review-sign-in'
      views:
        'container':
          templateUrl: 'short-form/templates/f1a-review-sign-in.html'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.clearAccountMessages()
        AccountService.resetUserAuth()
        AccountService.copyApplicantFields()
        AccountService.lockCompletedFields()
      ]
    })
    .state('dahlia.short-form-application.review-terms', {
      url: '/review-terms?loginMessage'
      params:
        loginMessage: { squash: true }
      views:
        'container':
          templateUrl: 'short-form/templates/f2-review-terms.html'
      onEnter: ['$stateParams', '$translate', 'AccountService', ($stateParams, $translate, AccountService) ->
        AccountService.clearAccountMessages()
        if $stateParams.loginMessage
          if $stateParams.loginMessage == 'update'
            message = $translate.instant('SIGN_IN.SIGNED_IN_SUCCESSFULLY_AND_UPDATED')
          else
            message = $translate.instant('SIGN_IN.SIGNED_IN_SUCCESSFULLY')
          AccountService.accountSuccess.messages.login = message
      ]
    })
    .state('dahlia.short-form-application.confirmation', {
      url: '/confirmation'
      views:
        'container':
          templateUrl: 'short-form/templates/g1-confirmation.html'
    })
    .state('dahlia.short-form-application.review-submitted', {
      url: '/review-submitted'
      views:
        'container@':
          templateUrl: 'short-form/templates/review-application.html'
          controller: 'ShortFormApplicationController'
      onEnter: [
        '$state', 'ShortFormApplicationService',
        ($state, ShortFormApplicationService) ->
          applicationDataExists = !!ShortFormApplicationService.application.lotteryNumber
          return if applicationDataExists
          $state.go('dahlia.welcome')
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
          '$stateParams', '$state', 'ShortFormApplicationService',
          ($stateParams, $state, ShortFormApplicationService) ->
            ShortFormApplicationService.getApplication($stateParams.id).then ->
              if !ShortFormApplicationService.applicationWasSubmitted()
                $state.go('dahlia.my-applications')
        ]
      onExit: [
        'ShortFormApplicationService',
        (ShortFormApplicationService) ->
          ShortFormApplicationService.resetUserData()
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
    .state('dahlia.short-form-application.choose-account-settings', {
      url: '/choose-account-settings'
      views:
        'container@':
          templateUrl: 'short-form/templates/choose-account-settings.html'
          controller: 'ShortFormApplicationController'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
      onEnter: [
        '$state', 'ShortFormApplicationService',
        ($state, ShortFormApplicationService) ->
          if _.isEmpty(ShortFormApplicationService.application)
            $state.go('dahlia.my-applications')
        ]
    })

    $urlRouterProvider.otherwise('/') # default to welcome screen

    # have to check if browser supports html5mode (http://stackoverflow.com/a/22771095)
    if !!(window.history && history.pushState)
      $locationProvider.html5Mode({enabled: true, requireBase: false})
]
