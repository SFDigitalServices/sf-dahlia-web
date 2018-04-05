namespace :dev do
  desc 'Toggles memcache for development (requires memcached running locally)'
  task cache: :environment do
    if File.exist? 'tmp/caching-dev.txt'
      File.delete 'tmp/caching-dev.txt'
      puts 'Development mode is no longer being cached. Please restart your server.'
    else
      FileUtils.touch 'tmp/caching-dev.txt'
      puts 'Development mode is now being cached. Please restart your server.'
    end
  end
end
