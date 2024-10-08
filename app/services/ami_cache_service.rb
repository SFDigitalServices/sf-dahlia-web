# service class for pre-fetching + caching ami data
# logic ported over from getAmiChartDataFromUnits in listingUtil.ts
class AmiCacheService
  def cache_ami_chart_data(units)
    return unless units

    ami_types = get_ami_chart_data_from_units(units)
    ami_types&.each do |ami_type|
      Force::ListingService.ami({ data: ami_type, force: true })
    end
  end

  private

  def check_ami_match(unique_charts, unit)
    match = {
      'max' => false,
      'min' => false,
    }
    unique_charts.each do |unique_chart|
      if unique_chart['year'] != unit['AMI_chart_year'] ||
         unique_chart['chartType'] != unit['AMI_chart_type']
        next
      end

      if unique_chart['percent'] == unit['Max_AMI_for_Qualifying_Unit']
        match['max'] =
          true
      end
      if unique_chart['percent'] == unit['Min_AMI_for_Qualifying_Unit']
        match['min'] =
          true
      end
    end
    match
  end

  def build_uniq_chart(unit, max)
    {
      'year' => unit['AMI_chart_year'],
      'chartType' => unit['AMI_chart_type'],
      'percent' => if max
                     unit['Max_AMI_for_Qualifying_Unit']
                   else
                     unit['Min_AMI_for_Qualifying_Unit']
                   end,
      'derivedFrom' => max ? 'MaxAmi' : 'MinAmi',
    }
  end

  def get_ami_chart_data_from_units(units)
    unique_charts = []

    units.each do |unit|
      # check if the min and max ami of the unit is already in our list of ami charts
      match = check_ami_match(unique_charts, unit)

      # if max ami is not already in the list of ami charts
      if !match['max'] && unit['Max_AMI_for_Qualifying_Unit']
        unique_charts << build_uniq_chart(unit, true)
      end

      # if min ami is not already in the list of ami charts
      next unless !match['min'] && unit['Min_AMI_for_Qualifying_Unit']

      unique_charts << build_uniq_chart(unit, false)
    end
    unique_charts
  end
end
