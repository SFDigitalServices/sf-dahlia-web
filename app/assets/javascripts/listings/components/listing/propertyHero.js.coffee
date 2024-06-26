angular.module('dahlia.components')
.component 'propertyHero',
  templateUrl: 'listings/components/listing/property-hero.html'
  require:
    parent: '^listingContainer'
  controller: [
    'ListingDataService', 'ListingUnitService', '$filter', '$sce', '$timeout', '$translate', '$window',
    (ListingDataService, ListingUnitService, $filter, $sce, $timeout, $translate, $window) ->
      ctrl = @

      @isLoadingUnits = () ->
        ListingUnitService.loading.units

      @hasUnitsError = () ->
        ListingUnitService.error.units

      @adjustCarouselHeight = (elem) ->
        $timeout ->
          ctrl.carouselHeight = elem[0].offsetHeight
        , 0, false

      @carouselHeight = 300

      @reservedUnitIcons = [
        $sce.trustAsResourceUrl('#i-star')
        $sce.trustAsResourceUrl('#i-cross')
        $sce.trustAsResourceUrl('#i-oval')
        $sce.trustAsResourceUrl('#i-polygon')
      ]

      @listingImages = (listing) ->
        # TODO: update when we are getting multiple images from Salesforce
        # right now it's just an array of one
        [listing.imageURL]

      @reservedDescriptorIcon = (listing, descriptor) ->
        index = _.findIndex(listing.reservedDescriptor, ['name', descriptor])
        @reservedUnitIcons[index]

      @_getPercentString = (v) -> "#{v}%"

      @getCurrencyString = (v) -> $filter('currency')(v, '$', 0)

      @getCurrencyRange = (min, max) ->
        if min? && max?
          $translate.instant('listings.stats.currency_range', {
            currencyMinValue: @getCurrencyString(min)
            currencyMaxValue: @getCurrencyString(max)
          })
        else if max?
          $translate.instant('listings.stats.currency_range', {
            currencyMinValue: @getCurrencyString(0)
            currencyMaxValue: @getCurrencyString(max)
          })
        else if min?
          @getCurrencyString(min)
        else
          ""

      @getIncomeRangeFromUnitGroup = (unitGroup) -> @getCurrencyRange(unitGroup.minIncome, unitGroup.maxIncome)
      @getIncomeRangeFromPriceGroup = (priceGroup) -> @getCurrencyRange(priceGroup.minIncome, priceGroup.maxIncome)

      @getHouseholdTextFromOccupancy = (occupancy) ->
        if occupancy == '1'
          $translate.instant('listings.stats.num_in_household_singular')
        else
          $translate.instant('listings.stats.num_in_household_plural')

      @isWaitlist = (priceGroup) -> priceGroup.Status == "Occupied"

      @numAvailableString = (priceGroup) ->
        if @isWaitlist(priceGroup)
          $translate.instant('listings.stats.waitlist')
        else
          # Only used for rental listings, so we can use the rental chinese translation
          priceGroup.total + " " + $translate.instant('listings.stats.available_rental')

      occupanciesToIsExpanded = {}

      @isExpanded = (priceGroup) ->
        hasOnlyOneAccordionGroup = this.parent.listing.groupedUnits.length == 1
        groupNotToggledYet = occupanciesToIsExpanded[priceGroup.occupancy] == undefined

        # Start with group expanded if there's only one group.
        if hasOnlyOneAccordionGroup && groupNotToggledYet
          true
        else
          !!occupanciesToIsExpanded[priceGroup.occupancy]

      @toggleExpanded = (priceGroup) ->
        occupanciesToIsExpanded[priceGroup.occupancy] = !@isExpanded(priceGroup)

      @labelForIncomeLevelTable = (occupancy, incomeLevelString) ->
        $translate.instant('listings.stats.table_label', {
          numInHouseholdString: "#{occupancy} #{@getHouseholdTextFromOccupancy(occupancy)}",
          amiPercentString: incomeLevelString
        })

      @_rowId = (prefix, unitGroup, incomeLevelIndex, priceGroupIndex) ->
        "#{prefix}__occupancy_#{unitGroup.occupancy}__income_#{incomeLevelIndex}__price_group_#{priceGroupIndex}"

      @unitTypeId = (unitGroup, incomeLevelIndex, priceGroupIndex) ->
        @_rowId('unit_type', unitGroup, incomeLevelIndex, priceGroupIndex)

      @incomeRowId = (unitGroup, incomeLevelIndex, priceGroupIndex) ->
        @_rowId('income', unitGroup, incomeLevelIndex, priceGroupIndex)

      @rentRowId = (unitGroup, incomeLevelIndex, priceGroupIndex) ->
        @_rowId('rent', unitGroup, incomeLevelIndex, priceGroupIndex)

      @_isRentAsPercentOfIncome = (priceGroup) -> priceGroup.Rent_percent_of_income != undefined

      @getRentRowValue = (priceGroup) ->
        if @_isRentAsPercentOfIncome(priceGroup)
          @_getPercentString(priceGroup.Rent_percent_of_income)
        else
          @getCurrencyString(priceGroup.BMR_Rent_Monthly)

      @getRentRowSubtitle = (priceGroup) ->
        if @_isRentAsPercentOfIncome(priceGroup)
          $translate.instant('t.income')
        else
          $translate.instant('t.per_month')

      return ctrl
  ]
