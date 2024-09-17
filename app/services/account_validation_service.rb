# Class AccountValidationService validates account details
class AccountValidationService
  def self.valid_dob?(dob)
    if dob =~ /\A(\d{4})-(\d{2})-(\d{2})\z/
      year = Regexp.last_match(1).to_i
      month = Regexp.last_match(2).to_i
      day = Regexp.last_match(3).to_i
      year >= 1900 && (1..12).include?(month) && (1..31).include?(day)
    else
      false
    end
  end

  def self.name_field_has_invalid_characters?(name)
    if name.empty?
      return "is empty"
    elsif includes_url_characters(name)
      return "contains invalid characters"
    end

    return false
  end

  def self.includes_url_characters(value)
    value.include?('www') || value.include?('http') || value.include?('.')
  end
end
