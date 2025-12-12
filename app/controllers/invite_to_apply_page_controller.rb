# Controller for the page shown when applicants respond to invite to apply email
class InviteToApplyPageController < ApplicationController
  def index
    @invite_to_apply_props = props

    # TODO: isTestEmail toggle
    if params['deadline'].present? && Time.zone.parse(params['deadline']).to_date >= Time.zone.today
      record_response(
        params['deadline'],
        params['applicationNumber'],
        params['response'],
      )
    end
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
        deadline: params['deadline'],
        response: params['response'],
        applicationNumber: params['applicationNumber'],
      },
    }
  end

  def record_response(deadline, application_number, response)
    Rails.logger.info("Recording response: deadline=#{deadline}, application_number=#{application_number}, response=#{response}")

    DahliaBackend::MessageService.send_invite_to_apply_response(
      deadline,
      application_number,
      response,
      params['id'],
    )
  end

  def use_react_app
    true
  end
end
