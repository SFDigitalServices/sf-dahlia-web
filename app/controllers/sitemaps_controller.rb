# Displays sitemap.xml for SEO
class SitemapsController < ApplicationController
  def generate
    render xml: sitemap_xml
  end

  private

  def host_name
    host = ENV['MAILER_DOMAIN']
    host ||= ENV['HEROKU_APP_NAME'] ? "#{ENV['HEROKU_APP_NAME']}.herokuapp.com" : nil
    host || 'housing.sfgov.org'
  end

  def sitemap_xml
    listings = ListingService.listings()
    @sitemap = SitemapGenerator::Builder::SitemapFile.new(host: 'https://' + host_name)
    @sitemap.add '/', changefreq: 'weekly', priority: 1.0
    @sitemap.add '/welcome-chinese', changefreq: 'weekly'
    @sitemap.add '/welcome-spanish', changefreq: 'weekly'
    @sitemap.add '/welcome-filipino', changefreq: 'weekly'
    @sitemap.add '/listings', changefreq: 'daily', priority: 0.75
    @sitemap.add '/eligibility-estimator', changefreq: 'monthly'
    @sitemap.add '/get-assistance', changefreq: 'monthly'
    @sitemap.add '/housing-counselors', changefreq: 'monthly'
    @sitemap.add '/additional-resources', changefreq: 'monthly'
    @sitemap.add '/create-account', changefreq: 'monthly'
    @sitemap.add '/sign-in', changefreq: 'monthly'
    @sitemap.add '/disclaimer', changefreq: 'monthly'
    @sitemap.add '/privacy', changefreq: 'monthly'
    listings.each do |listing|
      path = "/listings/#{listing['listingID']}"
      @sitemap.add path, changefreq: 'daily', priority: 0.75
    end
    @sitemap.to_xml
  end
end
