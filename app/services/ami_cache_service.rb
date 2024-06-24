class AmiCacheService
  def cache_ami_chart_data(units)
    return unless units

    max_ami_types = get_max_ami_chart_data_from_units(units)
    min_ami_types = get_min_ami_chart_data_from_units(units)
    max_ami_types&.each do |max_ami_type|
      Force::ListingService.ami({ data: max_ami_type, force: true })
    end
    min_ami_types&.each do |min_ami_type|
      Force::ListingService.ami({ data: min_ami_type, force: true })
    end
  end
  def max_ami_match(unique_chart, unit)
    unique_chart['year'] == unit['AMI_chart_year'] and
      unique_chart['type'] == unit['AMI_chart_type'] and
      unique_chart['percent'] == unit['Max_AMI_for_Qualifying_Unit']
  end

  private

  def get_max_ami_chart_data_from_units(units)
    unique_charts = []

    units.each do |unit|
      unique_chart_match_for_max = nil
      unique_charts.each do |unique_chart|
        next unless max_ami_match(unique_chart, unit)

        unique_chart_match_for_max = unique_chart

        break
      end

      next unless !unique_chart_match_for_max && unit['Max_AMI_for_Qualifying_Unit']

      unique_charts << {
        'year' => unit['AMI_chart_year'],
        'type' => unit['AMI_chart_type'],
        'percent' => unit['Max_AMI_for_Qualifying_Unit'],
        'derivedFrom' => 'MaxAmi',
      }
    end
    unique_charts
  end

  def min_ami_match(unique_chart, unit)
    unique_chart['year'] == unit['AMI_chart_year'] and
      unique_chart['type'] == unit['AMI_chart_type'] and
      unique_chart['percent'] == unit['Min_AMI_for_Qualifying_Unit']
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
