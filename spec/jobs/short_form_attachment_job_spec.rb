require 'rails_helper'

# adapted from https://gist.github.com/ChuckJHardy/10f54fc567ba3bd4d6f1
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

  describe '#perform' do
    it 'submits attachment file and marks it as delivered' do
      args = [application_id, file, file.descriptive_name]
      response = Hashie::Mash.new(status: 200)
      expect(ShortFormService).to receive(:attach_file).with(*args).and_return(response)
      perform_enqueued_jobs { job }
      # check that file has now been marked as delivered
      file.reload
      expect(file.file).to be_nil
      expect(file.application_id).to eq(application_id)
      expect(file.delivered_at).not_to be_nil
    end

    it 'logs errors if ShortFormService receives a bad response' do
      args = [application_id, file, file.descriptive_name]
      response = Hashie::Mash.new(status: 500)
      expect(ShortFormService).to receive(:attach_file).with(*args).and_return(response)
      perform_enqueued_jobs { job }
      # check that file has now been marked with error
      file.reload
      # file.file should still be preserved
      expect(file.file).not_to be_nil
      expect(file.application_id).to eq(application_id)
      expect(file.error).not_to be_nil
    end
  end

  after do
    clear_enqueued_jobs
    clear_performed_jobs
  end
end
