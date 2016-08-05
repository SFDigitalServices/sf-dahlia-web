# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    params = {
      lottery_number: '3888078',
      email: 'test@person.com',
      listing_id: 'a0WU000000CkiM3MAJ',
    }
    Emailer.submission_confirmation(params)
  end

  def confirmation_instructions
    u = User.first
    token = u.confirmation_token || 'xyzABC123'
    Emailer.confirmation_instructions(u, token)
  end
end
