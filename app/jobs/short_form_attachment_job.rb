# Job for processing attachment submissions to Salesforce
class ShortFormAttachmentJob < ActiveJob::Base
  queue_as :default

  def perform(application_id, file_id)
    file = UploadedFile.find(file_id)
    puts ">> UPLOADING #{application_id}, #{file.descriptive_name}"
    ShortFormService.attach_file(application_id, file, file.descriptive_name)
    # now that file is saved in SF, remove temp uploads
    file.destroy
  rescue ActiveRecord::RecordNotFound
    return
  end
end
