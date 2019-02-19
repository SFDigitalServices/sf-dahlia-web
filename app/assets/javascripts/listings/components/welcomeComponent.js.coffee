angular.module('dahlia.components')
.component 'welcomeComponent',
  templateUrl: 'listings/components/welcome-component.html'
  require:
    parent: '^listingContainer'