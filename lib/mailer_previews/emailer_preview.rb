# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    params = {
      short_form_id: 'a0tf0000000mMbm',
      listing_id: 'a0WU000000CkiM3MAJ',
    }
    Emailer.submission_confirmation(params)
  end
end
