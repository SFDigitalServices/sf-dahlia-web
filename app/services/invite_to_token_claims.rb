# Claim rules shared by the invite page (InviteToController) and record-response
# (Api::V1::InviteToResponseController), so the GET and record-response paths can't drift.
module InviteToTokenClaims
  NEXT_STEPS_PURPOSE = 'next_steps'.freeze

  # Email tokens carry act; next-steps page tokens carry the purpose claim instead. An
  # act-less token without it may have been signed from raw query params by the old
  # documents page, and these tokens have no exp.
  def self.trusted_origin?(claims)
    claims = claims.to_h.with_indifferent_access
    claims[:act].present? || claims[:purpose] == NEXT_STEPS_PURPOSE
  end

  # Time.zone.parse returns nil for some malformed input and raises on the rest; callers
  # treat both as an unverifiable deadline.
  def self.parse_deadline(deadline)
    Time.zone.parse(deadline.to_s)
  rescue ArgumentError, TypeError
    nil
  end
end
