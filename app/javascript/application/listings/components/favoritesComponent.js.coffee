angular.module('dahlia.components')
.component 'favoritesComponent',
  template: require('html-loader!application/listings/components/favorites-component.html')
  require:
    parent: '^listingContainer'
