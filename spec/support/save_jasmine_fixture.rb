require 'nokogiri'
# Build jasmine fixtures in the rspec instances (like 'it' and 'before' blocks)
SaveJasmineFixture = Struct.new(:response_body, :full_description) do
  def self.call(*args)
    new(*args).call
  end

  def call
    save_fixture
  end

  def save_fixture
    body_el = extract_html_body
    content = body_el || response_body
    File.write(jasmine_fixture_path, content)
  end

  private

  def extract_html_body
    Nokogiri::HTML(response_body).css('#body').first
  end

  def jasmine_filename
    full_description.underscore.parameterize + '.json'
  end

  def jasmine_fixture_path
    fixture_path = File.join(
      Rails.root, JasmineMacros::FIXTURE_DIRECTORY, jasmine_filename
    )
    fixture_directory = File.dirname(fixture_path)
    FileUtils.mkdir_p fixture_directory unless File.exist?(fixture_directory)
    fixture_path
  end
end
