require 'rails_helper'

# lifted from https://gist.github.com/ChuckJHardy/10f54fc567ba3bd4d6f1
RSpec.describe ShortFormAttachmentJob, type: :job do
  include ActiveJob::TestHelper

  let(:application_id) { 'ABC123' }
  let(:file) { create(:uploaded_file) }

  subject(:job) { described_class.perform_later(application_id, file.id) }

  it 'queues the job' do
    expect { job }.to have_enqueued_job(described_class)
      .with(application_id, file.id)
      .on_queue('default')
  end

  it 'executes perform' do
    args = [application_id, file, file.descriptive_name]
    expect(ShortFormService).to receive(:attach_file).with(*args)
    perform_enqueued_jobs { job }
    # check that file has now been deleted, we are unable to find it in the DB
    expect { file.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  after do
    clear_enqueued_jobs
    clear_performed_jobs
  end
end
