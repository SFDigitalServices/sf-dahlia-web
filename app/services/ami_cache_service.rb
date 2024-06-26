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
      'min' => false
    }
    unique_charts.each do |unique_chart|
      if unique_chart['year'] == unit['AMI_chart_year'] and
        unique_chart['type'] == unit['AMI_chart_type']
        if unique_chart['percent'] == unit['Max_AMI_for_Qualifying_Unit']
          match["max"] = true
        end
        if unique_chart['percent'] == unit['Min_AMI_for_Qualifying_Unit']
          match["min"] = true
        end
      end
    end
    match
  end

  def get_ami_chart_data_from_units(units)
    unique_charts = []

    units.each do |unit|
      # check if the min and max ami of the unit is already in our list of ami charts
      match = check_ami_match(unique_charts, unit)

      # if max ami is not already in the list of ami charts
      if !match["max"] && unit['Max_AMI_for_Qualifying_Unit']
        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Max_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MaxAmi',
        }
      end

      # if min ami is not already in the list of ami charts
      if !match["min"] && unit['Min_AMI_for_Qualifying_Unit']
        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Min_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MinAmi',
        }
      end
    end
    unique_charts
  end

  def get_min_ami_chart_data_from_units(units)
    unique_charts = []

    units.each do |unit|
      unique_chart_match_for_min = nil
      unique_charts.each do |unique_chart|
        next unless min_ami_match(unique_chart, unit)

        unique_chart_match_for_min = unique_chart
        break
      end

      next unless !unique_chart_match_for_min && unit['Min_AMI_for_Qualifying_Unit']

      unique_charts << {
        'year' => unit['AMI_chart_year'],
        'type' => unit['AMI_chart_type'],
        'percent' => unit['Min_AMI_for_Qualifying_Unit'],
        'derivedFrom' => 'MinAmi',
      }
    end
    unique_charts
  end
end
