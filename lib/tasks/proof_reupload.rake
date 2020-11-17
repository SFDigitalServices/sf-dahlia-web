require 'optparse'

namespace :proof do # rubocop:disable Metrics/BlockLength
  desc 'Re-upload provided failed proof uploads'
  task reupload: :environment do
    puts 'performing reupload task'
    options = get_args(ARGV)

    @result_ids = {
      successful: [],
      with_no_record: [],
      with_no_file: [],
      with_no_application_id: [],
      failed_fetch_application: [],
      with_null_error: [],
      with_upload_to_salesforce_error: [],
    }

    if options[:is_dry_run]
      for_each_id_in_file(options[:filename], :dry_run_process_id)
    else
      for_each_id_in_file(options[:filename], :process_id)
    end

    puts
    print_results
    exit
  end

  private

  def print_results
    puts 'Processed all IDs.' \
    "\n  Successful: #{@result_ids[:successful]}" \
    "\n  No record found: #{@result_ids[:with_no_record]}" \
    "\n  Record file is null: #{@result_ids[:with_no_file]}" \
    "\n  Record application id is null: #{@result_ids[:with_no_application_id]}" \
    "\n  Record error is null: #{@result_ids[:with_null_error]}" \
    "\n  Application fetch failed: #{@result_ids[:failed_fetch_application]}" \
    "\n  Salesforce error: #{@result_ids[:with_upload_to_salesforce_error]}"
  end

  def dry_run_process_id(id)
    puts "Processing id #{id} (dry run)"

    @result_ids[:successful].append(id)
  end

  def process_id(id)
    puts "Processing id #{id}"
    record = UploadedFile.find_by(id: id)

    return unless check_required_fields?(id, record)

    application = Force::ShortFormService.get(record[:application_id])

    if application.nil?
      log_error(
        id,
        "ShortFormService.get(#{record[:application_id]}) returned nil.",
        :failed_fetch_application,
      )
      return
    end

    response =
      Force::ShortFormService.attach_file(application, record, record.descriptive_name)

    if response.status != 200
      log_error(id, 'attach_file failed', :with_upload_to_salesforce_error)
      return
    end

    # on succeed, null out file and error in pg db
    ShortFormAttachmentJob.update_file_on_success(record, record[:application_id])

    @result_ids[:successful].append(id)
  end

  def check_required_fields?(id, record)
    if record.nil?
      log_error(id, 'Record not found.', :with_no_record)
      return false
    end

    if record[:error].nil?
      log_error(id, 'Record field error is null', :with_null_error)
      return false
    end

    if record[:file].nil?
      log_error(id, 'Record field file is null', :with_no_file)
      return false
    end

    if record[:application_id].nil?
      log_error(id, 'Record field application_id is null', :with_no_application_id)
      return false
    end

    true
  end

  def log_error(id, message, id_list_sym)
    puts "Error for id: #{id}. Message: #{message}"
    @result_ids[id_list_sym].append(id)
  end

  def for_each_line_in_file(filename, func)
    fpath = File.expand_path(filename)
    File.readlines(fpath).each do |line|
      method(func).call(line.gsub(/\s+/, ''))
    end
  end

  def get_args(cmd_args)
    options = { is_dry_run: true }

    o = OptionParser.new
    o.banner = 'Usage: rake proof:reupload -- [options]'

    o.on(
      '-d',
      '--dry-run [FLAG]',
      TrueClass,
      'When dry-run is off, we actually upload the proofs. Defaults to true.',
    ) do |is_dry_run|
      options[:is_dry_run] = is_dry_run.nil? ? true : is_dry_run
    end

    o.on('-f', '--failedProofsFile ARG', String) do |filename|
      options[:filename] = filename
    end

    args = o.order!(cmd_args) {}
    o.parse!(args)

    unless valid_filename?(options[:filename])
      raise "Invalid filename passed: #{options[:filename]}"
    end

    options
  end

  def valid_filename?(filename)
    return false unless filename.present?

    fpath = File.expand_path(filename)
    File.exist?(fpath)
  end
end
