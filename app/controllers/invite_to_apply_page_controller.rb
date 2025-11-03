# Controller for the page shown when applicants respond to invite to apply email
class InviteToApplyPageController < ApplicationController
  def index
    @invite_to_apply_props = { 
      assetPaths: static_asset_paths,
      urlParams: { 
        listing: params['listingId'],
        response: params['response'],
        deadline: params['deadline']
      } 
    }
    render 'invite_to_apply'
  end

  def deadline_passed
    @invite_to_apply_props = { 
      assetPaths: static_asset_paths,
      urlParams: { 
        listing: params['listingId'],
        response: 'x'
      } 
    }
    render 'invite_to_apply'
  end

  def use_react_app
    true
  end
end
