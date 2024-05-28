# Controller for the DAHLIA short form application.
class ShortFormApplicationController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user.present?
      find_listing_application
      find_application_files
    end

    @short_form_application_props = {
      assetPaths: static_asset_paths,
      application: @application,
      files: @files,
    }
  end

  def find_listing_application
    opts = {
      contact_id: user_contact_id,
      listing_id: params[:listing_id],
      autofill: params[:autofill],
    }
    @application = Force::ShortFormService.find_listing_application(opts)
  end

  def find_application_files
    @files = UploadedFile.where(
      user_id: current_user.id,
      listing_id: params[:listing_id],
    )
  end

  def user_contact_id
    if current_user
      current_user.salesforce_contact_id
    elsif unconfirmed_user_with_temp_session_id
      @unconfirmed_user.salesforce_contact_id
    end
  end

  protected

  def use_react_app
    true
  end
end
