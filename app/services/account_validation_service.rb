# Class AccountValidationService validates account details
class AccountValidationService
  def self.valid_dob?(dob)
    if dob =~ /\A(\d{4})-(\d{2})-(\d{2})\z/
      year = Regexp.last_match(1).to_i
      month = Regexp.last_match(2).to_i
      day = Regexp.last_match(3).to_i
      year > 1900 && (1..12).include?(month) && (1..31).include?(day)
    else
      false
    end
  end

  def self.name_fields_have_invalid_characters?(contact)
    contact_names = [contact[:firstName], contact[:lastName]]
    contact_names.any? { |name| includes_url_characters(name) }
  end

  def self.includes_url_characters(value)
    value.include?('www') || value.include?('http') || value.include?('.')
  end
end
