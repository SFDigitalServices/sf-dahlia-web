# frozen_string_literal: true

module Force
  class HousingCounselorService
    def self.agencies
      Request.new.cached_get('/housingCounselingAgencies/')
    end

    def self.authorize_access(applicant_contact_id:, counselor_contact_id:)
      return if applicant_contact_id.blank? || counselor_contact_id.blank?

      counselor = fetch_housing_counselor(counselor_contact_id)
      unless counselor
        log_if_not_housing_counselor(nil, counselor_contact_id)
        return
      end

      applicant = Force::AccountService.get(applicant_contact_id)
      unless access?(counselor, applicant)
        log_access_denied(
          counselor,
          applicant,
          applicant_contact_id:,
          counselor_contact_id:,
        )
        return
      end

      { applicant_contact_id:, counselor_contact_id: }
    rescue Restforce::NotFoundError => e
      Rails.logger.info(
        "HousingCounselorService#authorize_access: #{e.message}",
      )
      nil
    end

    def self.fetch_housing_counselor(counselor_contact_id)
      result = Request.new.get("/housingCounselingAgencies/#{counselor_contact_id}")
      find_counselor(result, counselor_contact_id)
    rescue Restforce::NotFoundError => e
      Rails.logger.info(
        'HousingCounselorService housingCounselingAgencies ' \
        "response=#{e.message}",
      )
      nil
    end

    def self.find_counselor(agencies, counselor_contact_id)
      Array.wrap(agencies).each do |agency|
        counselors = Array.wrap(agency['housingCounselors'])
        counselor = counselors.find { |contact| contact['id'] == counselor_contact_id }
        next unless counselor

        return counselor.merge('relatedAccount' => agency['id'])
      end
      nil
    end

    def self.access?(counselor, applicant)
      counselor && applicant &&
        counselor['isHousingCounselor'] &&
        !counselor['inactiveContact'] &&
        counselor['relatedAccount'].present? &&
        counselor['relatedAccount'] == applicant['housingCounselingAgencyId']
    end

    def self.log_access_denied(
      counselor, applicant, applicant_contact_id:, counselor_contact_id:
    )
      log_if_not_housing_counselor(counselor, counselor_contact_id)
      log_if_inactive_housing_counselor(counselor, counselor_contact_id)
      log_if_agency_denied(
        counselor,
        applicant,
        applicant_contact_id:,
        counselor_contact_id:,
      )
    end

    def self.log_if_not_housing_counselor(counselor, counselor_contact_id)
      if counselor.nil?
        Rails.logger.error(
          'Housing counselor contact is not associated with an agency ' \
          "contact ID=#{counselor_contact_id}",
        )
        return
      end

      return if counselor['isHousingCounselor']

      Rails.logger.error(
        'The currently logged in user with contact ' \
        "ID=#{counselor_contact_id} is not a housing counselor",
      )
    end

    def self.log_if_inactive_housing_counselor(counselor, counselor_contact_id)
      return unless counselor
      return unless counselor['inactiveContact']

      Rails.logger.error(
        'The currently logged in housing counselor with contact ' \
        "ID=#{counselor_contact_id} is inactive",
      )
    end

    def self.log_if_agency_denied(
      counselor, applicant, applicant_contact_id:, counselor_contact_id:
    )
      return unless applicant

      if applicant['housingCounselingAgencyId'].blank?
        Rails.logger.error(
          'The provided applicant contact ' \
          "ID=#{applicant_contact_id} user did not grant access to a " \
          'housing counselor agency',
        )
      elsif counselor &&
            counselor['relatedAccount'] != applicant['housingCounselingAgencyId']
        Rails.logger.error(
          'The housing counselor agency relatedAccount ' \
          "ID=#{counselor['relatedAccount']} of the housing counselor " \
          "contact ID=#{counselor_contact_id} does not match the applicant " \
          "contact ID=#{applicant_contact_id} housing counselor agency " \
          "ID=#{applicant['housingCounselingAgencyId']}",
        )
      end
    end
    private_class_method :fetch_housing_counselor, :find_counselor, :access?,
                         :log_access_denied, :log_if_not_housing_counselor,
                         :log_if_inactive_housing_counselor,
                         :log_if_agency_denied
  end
end
