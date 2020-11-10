require 'optparse'

namespace :proof do # rubocop:disable Metrics/BlockLength
  desc 'Re-upload provided failed proof uploads'
  task reupload: :environment do
    puts 'performing reupload task'
    options = get_args(ARGV)

    for_each_line_in_file(options[:filename], :process_id)
    exit
  end

  private

  def process_id(id)
    puts "Processing id #{id}"
    # record = UploadedFile.where(id: id)
    # get most recent record
    # Check that the record has error != null
    # Check that the record has a file
    # retry uploading to salesforce
    # on fail, print error
    # on succeed, null out file and error in pg db
  end

  def for_each_line_in_file(filename, func)
    fpath = File.expand_path(filename)
    File.readlines(fpath).each do |line|
      method(func).call(line.gsub(/\s+/, ''))
    end
  end

  def valid_filename?(filename)
    return false unless filename.present?

    fpath = File.expand_path(filename)
    File.exist?(fpath)
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
end
