# Controller for the page shown when applicants are invited to interview (100% affordable)
class InviteToInterviewPageController < ApplicationController
  def index
    @invite_to_interview_props = {
      assetPaths: static_asset_paths,
    }
    render 'invite_to_interview'
  end

  private

  def use_react_app
    true
  end
end
