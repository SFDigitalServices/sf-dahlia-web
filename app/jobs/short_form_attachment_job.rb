# Job for processing attachment submissions to Salesforce
class ShortFormAttachmentJob < ActiveJob::Base
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |e|
    # catch UploadedFile not being found
  end

  def perform(application_id, file_id)
    file = UploadedFile.find(file_id)
    # if file has been cleared out, we can escape
    return unless file.file
    application = ShortFormService.get(application_id)
    if application
      response = ShortFormService.attach_file(application, file, file.descriptive_name)
      if response.status == 200
        # now that file is saved in SF, remove file binary and mark as delivered
        file.update(
          file: nil,
          application_id: application_id,
          delivered_at: DateTime.now,
        )
        return
      else
        error_message = "status: #{response.status}; #{response.body}"
      end
    else
      error_message = 'Application not found.'
    end
    logger.error "ShortFormAttachmentJob error: #{application_id}"
    file.update(
      application_id: application_id,
      error: error_message,
    )
  end
end
