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
      next if f !~ %r{images/|json/} || f =~ %r{favicon/}
      filename = Pathname(f).basename.to_s
      asset_paths[filename] = asset_path(filename)
    end
    asset_paths
  end

  def prod_asset_paths
    asset_paths = {}
    Rails.application.assets_manifest.assets.each do |f, hashpath|
      next if f !~ /jpg|png|svg|json/ || f =~ /favicon|apple\-icon|android\-icon/
      f = f.gsub('translations/', '') if f =~ %r{translations/}
      asset_paths[f] = "/assets/#{hashpath}"
    end
    asset_paths
  end
end
