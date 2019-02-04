angular.module('dahlia.components')
.component 'welcomeComponent',
  templateUrl: 'listings/components/welcome-component.html'
  require:
    parent: '^listingContainer'

  controller: ['$window', ($window) ->
    ctrl = @
    @showSaleListings = $window.env.showSaleListings == 'true'

    return ctrl
  ]
