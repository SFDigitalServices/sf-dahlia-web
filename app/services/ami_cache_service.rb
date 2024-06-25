class AmiCacheService
  def cache_ami_chart_data(units)
    return unless units

    ami_types = get_ami_chart_data_from_units(units)
    ami_types&.each do |ami_type|
      Force::ListingService.ami({ data: ami_type, force: true })
    end
  end

  def ami_match(unique_chart, unit, field)
    unique_chart['year'] == unit['AMI_chart_year'] and
      unique_chart['type'] == unit['AMI_chart_type'] and
      unique_chart['percent'] == unit[field]
  end

  private

  def get_ami_chart_data_from_units(units)
    unique_charts = []

    units.each do |unit|
      unique_chart_match_for_max = nil
      unique_chart_match_for_min = nil
      unique_charts.each do |unique_chart|
        if ami_match(unique_chart, unit, 'Max_AMI_for_Qualifying_Unit')
          unique_chart_match_for_max = unique_chart
        end

        if ami_match(unique_chart, unit, 'Min_AMI_for_Qualifying_Unit')
          unique_chart_match_for_min = unique_chart
        end
      end

      if !unique_chart_match_for_max && unit['Max_AMI_for_Qualifying_Unit']
        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Max_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MaxAmi',
        }
      end

      if !unique_chart_match_for_min && unit['Min_AMI_for_Qualifying_Unit']
        unique_charts << {
          'year' => unit['AMI_chart_year'],
          'type' => unit['AMI_chart_type'],
          'percent' => unit['Max_AMI_for_Qualifying_Unit'],
          'derivedFrom' => 'MaxAmi',
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
