do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $state = {current: {name: undefined}}
    sections = [
      { name: 'You', pages: [
          'name',
          'contact',
          'verify-address',
          'alternate-contact-type',
          'alternate-contact-name',
          'alternate-contact-phone-address',
        ]
      },
      { name: 'Household', pages: [
          'household-intro',
          'household-overview',
          'household-members',
          'household-member-form',
          'household-member-form-edit'
        ]
      },
      { name: 'Status', pages: [
          'status-programs',
          'status-vouchers',
          'live-work-preference'
        ]
      },
      { name: 'Income', pages: [
          'income'
        ]
      },
      { name: 'Review', pages: [
          'review-optional',
          'review-summary',
          'review-terms'
        ]
      }
    ]

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      return
    )

    beforeEach inject((_ShortFormNavigationService_) ->
      ShortFormNavigationService = _ShortFormNavigationService_
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ShortFormNavigationService.sections).toEqual sections
        return
