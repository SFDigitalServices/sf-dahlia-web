class Api::V1::EmailController < ApiController
  # TODO: controller vs service
  def confirmation
    token = params[:t]
    secret = get_secret

    begin
      # TODO: tracking, monitoring, and logging activity
      # TODO: sometimes rails complains it cant find JWT
      # TODO: include application in url for debugging

      resp = JWT.decode(
        token,
        secret,
      )
      b, a, r, s = resp[0].values_at('b', 'a', 'r', 's')

      header = { 'Content-Type' => 'application/json' }
      body = build_request_body(r, a, s)

      Force::Request.new(parse_response: true)
                    .post_with_headers("/fieldUpdateComment/#{a}", body, header)

      listing_id = listing_id_map(b)
      redirect_to "/confirming_email?listing=#{listing_id}&response=#{r}"
    rescue JWT::ExpiredSignature
      puts 'token is expired'
      decoded_expired_token = JWT.decode(token, secret, true,
                                         { verify_expiration: false })
      b = decoded_expired_token[0]['b']
      listing_id = listing_id_map(b)
      redirect_to "/confirming_email?listing=#{listing_id}&response=x"
    rescue StandardError => e
      # TODO: error handling, including expired token page and Force call fails
      # TODO: how to get listing if token decode fails?
      puts 'error'
      puts e
      redirect_to "/confirming_email?listing=#{listing_id}&response=e"
    end
  end

  private

  def confirmation_params
    params.require(:t)
  end

  def listing_id_map(listing_number)
    array = ['', 'a0W4U00000KnLRMUA3', 'a0W4U00000IYEb4UAH', 'a0W4U00000IYSM4UAP',
             'a0W4U00000Ih1V2UAJ', 'a0W4U00000KnCZRUA3']
    array[listing_number]
  end

  def build_request_body(token_resp, application, sent_date)
    formatted_date = convet_date_format(sent_date)

    case token_resp
    when 'y'
      [{ 'Processing_Status__c': 'Processing',
         'Processing_Comment__c': "MOHCD automated interest email sent on #{formatted_date}. Applicant responded Yes.",
         'Application__c': application }]
    when 'n'
      [{ 'Processing_Status__c': 'Withdrawn',
         'Processing_Comment__c': "MOHCD automated interest email sent on #{formatted_date}. Applicant responded No.",
         'Application__c': application,
         'Sub_Status__c': 'Written withdrawal' }]
    else
      # TODO: what to do in this case?
      []
    end
  end

  def convet_date_format(date)
    date = Date.parse(date)
    date.strftime('%B %d, %Y')
  end

  def get_secret
    ENV['JWT_TOKEN_SECRET'] || ''
  end
end
