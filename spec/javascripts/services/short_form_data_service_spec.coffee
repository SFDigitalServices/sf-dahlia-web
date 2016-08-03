do ->
  'use strict'
  describe 'ShortFormDataService', ->
    ShortFormDataService = undefined
    formatted = undefined
    fakeListingId = 'a0WU000000CkiM3MAJ'
    # mostly copied from ShortFormApplicationService.applicationDefaults
    fakeApplication =
      id: null
      lotteryNumber: null
      status: null
      applicationSubmittedDate: null
      surveyComplete: false
      applicationSubmissionType: "Electronic"
      applicant:
        firstName: 'Bernard'
        lastName: 'Sanders'
        home_address: { address1: null, address2: "", city: null, state: null, zip: null }
        language: 'English'
        phone: null
        mailing_address: { address1: null, address2: "", city: null, state: null, zip: null }
        gender: {}
        terms: {}
      alternateContact:
        firstName: 'Elizabeth'
        lastName: 'Warren'
        language: 'English'
        mailing_address: { address1: null, address2: "", city: null, state: null, zip: null }
      householdMembers: []
      preferences:
        liveInSf: null
        workInSf: null
        neighborhoodResidence: null
        liveInSf_file: null
        workInSf_file: null
        neighborhoodResidence_file: null
        liveInSf_file_loading: null
        workInSf_file_loading: null
        neighborhoodResidence_file_loading: null
        liveInSf_file_error: null
        workInSf_file_error: null
        neighborhoodResidence_file_error: null
      householdIncome: { incomeTotal: 0, incomeTimeframe: 'per_year' }
      completedSections:
        Intro: false
        You: false
        Household: false
        Status: false
        Income: false
      validatedForms:
        You: {}
        Household: {}
        Status: {}
        Income: {}
        Review: {}

    beforeEach module('dahlia.services', ($provide) ->
      return
    )

    beforeEach inject((_ShortFormDataService_) ->
      ShortFormDataService = _ShortFormDataService_
      return
    )

    describe 'formatApplication', ->
      beforeEach ->
        formatted = ShortFormDataService.formatApplication(fakeListingId, fakeApplication)

      it 'attaches given listingID', ->
        expect(formatted.listingID).toEqual(fakeListingId)
        return

      it 'renames applicant to primaryApplicant', ->
        expect(formatted.primaryApplicant.firstName).toEqual(fakeApplication.applicant.firstName)
        return
