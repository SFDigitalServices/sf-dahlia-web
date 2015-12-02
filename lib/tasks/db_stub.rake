# here so builds don't fail even after we remove PG on this branch
namespace :db do
  desc 'fake db:create to work on semaphoreci'
  task create: :environment do
    puts 'creating database (j/k)!'
  end
end
