angular.module('dahlia.components')
.component 'welcomeComponent',
  template: require('html-loader!application/listings/components/welcome-component.html')
  require:
    parent: '^listingContainer'
