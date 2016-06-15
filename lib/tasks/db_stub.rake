# here so builds don't fail even after we remove PG on this branch
namespace :db do
  desc 'fake db tasks to work on semaphoreci when ActiveRecord is not used'
  rule '' do |t|
    puts "pretending to run #{t.name}..."
  end
end
