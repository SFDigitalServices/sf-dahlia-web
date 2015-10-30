require 'English'
require 'open3'
require './spec/support/jasmine_macros'

# Run all tests as we would on CI
class Tests < Thor
  default_task :check

  COMMANDS = {
    'rubocop' => 'bundle exec rubocop --rails',
    'jscs' => 'bundle exec node_modules/jscs/bin/jscs .',
    'jshint' => 'bundle exec node_modules/jshint/bin/jshint .',
    'cane' => 'bundle exec cane',
    'rails_best_practices' => 'bundle exec rails_best_practices',
    'rspec' => 'bundle exec rspec',
    'jasmine' => 'SKIP_FIXTURES=true rake jasmine:ci',
  }

  desc :check, 'run all CI tasks'
  def check
    delete_jasmine_fixtures
    exit 1 unless results(COMMANDS).all?
  end

  desc :save_jasmine_fixtures, 'Build jasmine fixtures from rspec'
  def save_jasmine_fixtures
    delete_jasmine_fixtures
    run_command "bundle exec rspec -e '#{JasmineMacros::EXAMPLE_NAME}'"
  end

  private

  def delete_jasmine_fixtures
    FileUtils.rm_rf("#{JasmineMacros::FIXTURE_DIRECTORY}/.")
  end

  def results(commands)
    commands.values.map { |command| run_command(command) }
  end

  def run_command(command)
    Open3.pipeline("#{command}").first.success?
  end
end
