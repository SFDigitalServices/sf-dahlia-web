class AccountValidationService
    def self.valid_dob?(dob)
      if dob =~ /\A(\d{4})-(\d{2})-(\d{2})\z/
        year, month, day = $1.to_i, $2.to_i, $3.to_i
        year > 1900 && (1..12).include?(month) && (1..31).include?(day)
      else
        false
      end
    end
  end