# Use the official Ruby image
FROM ruby:3.1.3

# Install system dependencies (including Node.js and Yarn)
RUN apt-get update -qq && apt-get install -y curl gnupg postgresql-client

# Install Node.js and Yarn
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

# Install Bower globally
RUN npm install -g bower

# Set the working directory inside the container
WORKDIR /app

# Copy Gemfile and install gems
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy the application code into the container
COPY . .

# Ensure Node.js and Yarn are installed
RUN node -v && yarn -v

# Install Node.js dependencies (for Webpack)
RUN yarn install --check-files

# Install Bower dependencies as root
# RUN bower install --allow-root

# Precompile Webpack assets
RUN bundle exec rails assets:precompile

# Expose port 3000 for the Rails server
EXPOSE 3000

# Start the Rails server
CMD ["rails", "server", "-b", "0.0.0.0"]
