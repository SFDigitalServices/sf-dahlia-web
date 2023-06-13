# View helpers that should be available application-wide.
module ApplicationHelper
  def static_asset_paths
    if Rails.env.development?
      dev_asset_paths
    else
      prod_asset_paths
    end
  end

  private

  def dev_asset_paths
    asset_paths = {}
    Rails.application.assets.each_file do |f|
      next if f !~ %r{images/|json/}
      # TODO: this doesn't work for nested folder
      filename = Pathname(f).basename.to_s
      f = if defined?(asset_path)
            # this method is more "correct" in dev than the below one,
            # which can require server restart to pickup locale-en.json changes
            asset_path(filename, skip_pipeline: true)
          else
            # only needed for asset_redirect in ApplicationController
            ActionController::Base.helpers.asset_path(filename)
          end
      asset_paths[filename] = f
    end
    asset_paths
  end

  def prod_asset_paths
    asset_paths = {}
    Rails.application.assets_manifest.assets.each do |f, hashpath|
      next if f !~ /jpg|png|svg|json|ico/
      f = f.gsub('translations/', '') if f =~ %r{translations/}
      # TODO: ASSET_HOST is no longer used
      cdn_host = Rails.application.config.action_controller.asset_host
      base_url = cdn_host ? "https://#{cdn_host}" : ''
      asset_paths[f] = "#{base_url}/assets/#{hashpath}"
    end
    asset_paths
  end
end
