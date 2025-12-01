# API endpoint for invite to apply document submission
class Api::V1::InviteToApplySubmitController < ApiController
  def create
    application_number = params[:application_number]

    if application_number.blank?
      render json: { error: 'Application number is required' },
             status: :unprocessable_entity
      return
    end

    # Call the backend API through our service
    response = DahliaBackend::ApiClient.new.post(
      '/messages/invite-to-apply/response/submit',
      {
        applicants: [
          {
            lotteryNumber: '',
            applicationNumber: application_number,
            primaryContact: {
              firstName: '',
              email: '',
            },
          },
        ],
        listingId: '',
        listingName: '',
        listingAddress: '',
        listingNeighborhood: '',
        deadlineDate: '',
      },
    )

    if response
      render json: { success: true }, status: :ok
    else
      render json: { error: 'Failed to submit response' }, status: :internal_server_error
    end
  rescue StandardError => e
    Rails.logger.error("Error submitting invite to apply response: #{e.message}")
    render json: { error: 'An error occurred' }, status: :internal_server_error
  end
end
