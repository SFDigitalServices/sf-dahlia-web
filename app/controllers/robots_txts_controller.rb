# For rendering robots.txt based on ENV
class RobotsTxtsController < ApplicationController
  layout false
  caches_page :show

  def show
    if disallow_all_crawlers?
      render 'disallow_all', content_type: 'text/plain'
    else
      render 'allow', content_type: 'text/plain'
    end
  end

  private

  def disallow_all_crawlers?
    ENV['DISALLOW_ALL_WEB_CRAWLERS'].present?
  end
end
