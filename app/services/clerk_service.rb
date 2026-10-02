require 'clerk'

# Example Clerk session token: https://github.com/clerk/clerk-sdk-ruby
#   "sub" => "user_abc123",           # User ID
#   "sid" => "sess_xyz789",           # Session ID
#   "org_id" => "org_123",            # Organization ID (if applicable)
#   "org_slug" => "my-org",           # Organization slug
#   "org_role" => "org:admin",        # Organization role
#   "org_permissions" => [...],       # Organization permissions
#   "iat" => 1234567890,              # Issued at
#   "exp" => 1234571490,              # Expiration
#   ...
# }
class ClerkService
  # Raised for a confirmed "this Clerk user has no Salesforce contact id"
  # (missing user, or blank private_metadata) - as opposed to a network/API
  # failure while trying to find out. Callers that need to fail closed on
  # "couldn't tell" rather than treat it the same as a confirmed absence
  # (see HousingCounselorSession#hc_id_matches_current_user?) rely on this
  # distinction.
  class NotFoundError < StandardError; end

  class User
    attr_reader :id

    def initialize(id)
      @id = id
    end

    def email
      return @email if defined?(@email)

      @email = ClerkService.email_address(id)
    end

    def salesforce_contact_id
      return @salesforce_contact_id if defined?(@salesforce_contact_id)

      @salesforce_contact_id =
        begin
          ClerkService.salesforce_contact_id(id)
        rescue ClerkService::NotFoundError => e
          Rails.logger.info("Clerk user #{id} has no Salesforce contact ID: #{e.message}")
          nil
        rescue StandardError => e
          Rails.logger.warn(
            "Clerk user #{id}: Salesforce contact ID lookup failed: #{e.message}",
          )
          @salesforce_contact_id_lookup_failed = true
          nil
        end
    end

    # True once a lookup failure (as opposed to a confirmed "no contact id")
    # has prevented #salesforce_contact_id from being determined.
    def salesforce_contact_id_lookup_failed?
      @salesforce_contact_id_lookup_failed || false
    end
  end

  def self.email_address(user_id)
    user = sdk.users.get(user_id: user_id)&.user
    raise StandardError, "User #{user_id} is missing" if user.nil?

    # We assume the user has only one email address for now
    email = user.email_addresses&.first
    raise StandardError, "User #{user_id} has no email address" if email.blank?

    email.email_address
  end

  # Store the Salesforce contact id in the Clerk user's private metadata
  def self.store_salesforce_contact_id(user_id, contact_id)
    body = Clerk::Models::Operations::UpdateUserMetadataRequestBody.new(
      private_metadata: { 'salesforce_contact_id' => contact_id },
    )
    sdk.users.update_metadata(user_id: user_id, body: body)
    Rails.logger.info("Salesforce contact id stored for user #{user_id}")
  end

  def self.salesforce_contact_id(user_id)
    user = sdk.users.get(user_id: user_id)&.user
    raise NotFoundError, "User #{user_id} is missing" if user.nil?

    contact_id = user.private_metadata&.dig('salesforce_contact_id')
    if contact_id.blank?
      raise NotFoundError, "User #{user_id} has no Salesforce contact id"
    end

    contact_id
  end

  def self.sdk
    @sdk ||= Clerk::SDK.new
  end
  private_class_method :sdk
end
