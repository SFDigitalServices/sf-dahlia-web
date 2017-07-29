# View helpers that should be available application-wide.
module ApplicationHelper
  def image_asset_paths
    asset_paths = {}
    if Rails.env.development?
      Rails.application.assets.each_file do |f|
        next if !f.include?('images/') || f.include?('favicon')
        filename = Pathname(f).basename.to_s
        asset_paths[filename] = asset_path(filename)
      end
    else
      Rails.application.assets_manifest.assets.each do |f, hashpath|
        next if !f.match(/jpg|png|svg/) || f.match(/favicon|apple\-icon|android\-icon/)
        asset_paths[f] = "/assets/#{hashpath}"
      end
    end
    asset_paths
  end
end
