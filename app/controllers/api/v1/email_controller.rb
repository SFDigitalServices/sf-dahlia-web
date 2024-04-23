class Api::V1::EmailController < ApiController
  # TODO: controller vs service
  def confirmation
    token = params[:t]
    begin
      # TODO: sometimes rails complains it cant find JWT
      resp = JWT.decode(
        token,
        '123',
      )
      puts resp
    rescue StandardError => e
      # TODO: error handling
      puts 'error'
      puts e
      return e
    end

    body_array = [{ 'Processing_Status__c': 'Disqualified',
                    'Processing_Comment__c': 'adding a new comment from webapp this time',
                    'Application__c': 'a0o4U00000KK8dxQAD',
                    'Sub_Status__c': 'Missed 2 or more appointments' }]

    puts 'body_array'
    puts body_array.to_json

    header = { 'Content-Type' => 'application/json' }

    results = Force::Request.new(parse_response: true)
                            .post_with_headers('/fieldUpdateComment/a0o4U00000KK8dxQAD', body_array, header)

    puts results.to_json

    render json: { hello: resp }
  end

  private

  def confirmation_params
    params.require(:t)
  end
end
