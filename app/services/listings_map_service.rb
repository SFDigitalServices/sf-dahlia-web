# hackathon
class ListingsMapService
  LISTINGS_MAP_DATA_CACHE_KEY = 'listings_map_data'.freeze

  # listings map data structure
  # {
  #   'a01234': {
  #     address_string: '123 main st_san francisco_ca_91234'
  #     location: { lat: -123.123, lng: 321.321 },
  #   },
  # }

  def listings_map_data(listing_ids = nil)
    if listing_ids.present?
      cached_listings_map_data.try(:slice, *listing_ids)
    else
      cached_listings_map_data
    end
  end

  # Periodically run this to avoid taxing the geocoding service
  def save_latitude_longitude
    listings = Force::ListingService.listings
    listings_map_data = cached_listings_map_data || {}

    listings.each do |listing|
      listing_id = listing['Id']
      address_params, address_string = address_from_listing(listing)

      next unless address_params.present?

      cached_address_string = listings_map_data.dig(listing_id, :address_string)
      next if cached_address_string == address_string

      puts "geocoding #{listing_id} listing - #{address_string}"
      lat, lng = generate_latitude_longitude(address_params)
      puts " geocoded #{listing_id} listing - #{lat}, #{lng}"
      sleep 1

      listings_map_data[listing_id] = {
        address_string: address_string,
        location: { lat: lat, lng: lng },
        listing_name: listing['Name'],
      }
    end
    write_to_listings_map_data_to_cache(listings_map_data)
  end

  def manually_save_latitude_longitude(listing_id, latitude, longitude)
    listings_map_data = cached_listings_map_data
    listings_map_data[listing_id][:location][:lat] = latitude
    listings_map_data[listing_id][:location][:lng] = longitude
    write_to_listings_map_data_to_cache(listings_map_data)
  end

  def clean_listings_map_data_for_google_maps
    listings_map_data = cached_listings_map_data
    return {} if listings_map_data.blank?

    # some listings have duplicate addresses
    listings_map_data.select! { |_k, v| v[:location][:lat] && v[:location][:lng] }
  end

  # nice-to-haves only check listings that already have cached latitude and longitude
  def nice_to_haves_data
    puts 'TODO'
  end

  private

  def generate_latitude_longitude(address_params)
    address = AddressValidationService.new(address_params).validate
    latitude = address.try(:verifications).try(:delivery).try(:details).try(:latitude)
    longitude = address.try(:verifications).try(:delivery).try(:details).try(:longitude)
    return [] unless latitude && longitude

    [latitude, longitude]
  end

  def cached_listings_map_data
    Rails.cache.fetch(LISTINGS_MAP_DATA_CACHE_KEY)
  end

  def write_to_listings_map_data_to_cache(listings_map_data)
    Rails.cache.write(LISTINGS_MAP_DATA_CACHE_KEY, listings_map_data)
  end

  def address_from_listing(listing)
    # key values decided by easypost API in AddressValidationService
    address_params = {
      street1: listing['Building_Street_Address'],
      city: listing['Building_City'],
      state: listing['Building_State'],
      zip: listing['Building_Zip_Code'],
    }
    return [] unless address_params.values.all?(&:present?)

    address_string = address_params.values.join('_')

    [address_params, address_string]
  end
end
