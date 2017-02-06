require 'sitemap_generator'

desc 'This task is called by the Heroku scheduler add-on'

task generate_sitemap: :environment do
  listings = ListingService.listings(nil)
  SitemapGenerator::Sitemap.default_host = 'https://housing.sfgov.org'
  SitemapGenerator::Sitemap.create do
    add '/listings', changefreq: 'monthly'
    add '/eligibility-estimator', changefreq: 'monthly'
    add '/get-assistance', changefreq: 'monthly'
    add '/housing-counselors', changefreq: 'monthly'
    add '/additional-resources', changefreq: 'monthly'
    add '/create-account', changefreq: 'monthly'
    add '/sign-in', changefreq: 'monthly'
    add '/disclaimer', changefreq: 'monthly'
    add '/privacy', changefreq: 'monthly'
    listings.each do |listing|
      add "/listings/#{listing['listingID']}", changefreq: 'weekly'
    end
  end
end
