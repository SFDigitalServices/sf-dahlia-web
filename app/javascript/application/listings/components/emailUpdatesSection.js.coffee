angular.module('dahlia.components')
.component 'emailUpdatesSection',
  templateU: require('html-loader!application/listings/components/email-updates-section.html')
  require:
    parent: '^listingContainer'
