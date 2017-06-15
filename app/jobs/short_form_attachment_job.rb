# Job for processing attachment submissions to Salesforce
class ShortFormAttachmentJob < ActiveJob::Base
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |e|
    # catch UploadedFile not being found
  end

  def perform(application_id, file_id)
    file = UploadedFile.find(file_id)
    ShortFormService.attach_file(application_id, file, file.descriptive_name)
    # now that file is saved in SF, remove temp uploads
    file.destroy
  end
end
