# Serves the static 404 page for retired URLs that would otherwise fall through to the
# Angular catch-all.
class NotFoundController < ApplicationController
  def show
    render file: Rails.public_path.join('404.html'), status: :not_found, layout: false
  end
end
