# Controller for the page shown when applicants respond to invite to apply email
class InviteToApplyPageController < ApplicationController
  def index
    @invite_to_apply_props = props
    render 'invite_to_apply'
  end

  def deadline_passed
    @invite_to_apply_props = props.merge(deadlinePassedPath: true)
    render 'invite_to_apply'
  end

  def documents
    @invite_to_apply_props = props.merge(documentsPath: true)
    render 'invite_to_apply'
  end

  private

  def props
    {
      assetPaths: static_asset_paths,
      urlParams: {
      listing: params['listingId'],
      deadline: params['deadline'],
      response: params['response'],
      applicationNumber: params['applicationNumber']
    }
    }
  end

  def use_react_app
    true
  end
end
