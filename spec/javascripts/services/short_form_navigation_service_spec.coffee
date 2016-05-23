do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $state = {current: {name: undefined}}
    sections = [
      { name: 'You', pages: [
          'name',
          'contact',
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
          'status-vouchers'
        ]
      },
      { name: 'Income', pages: [
          'income'
        ]
      },
      { name: 'Review', pages: [
          'review-optional'
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
