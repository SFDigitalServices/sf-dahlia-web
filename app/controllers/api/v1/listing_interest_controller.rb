# Backend API for are you interested email
class Api::V1::ListingInterestController < ApiController
  def index
    token = params[:t]
    secret = env_secret

    begin
      resp = JWT.decode(
        token,
        secret,
      )
      # token is generated with a building number (0-5, which corresponding to the id mapping in listing_id_map),
      # the application id, the response from the email (y (yes) or n (no)), and the date the email was initially sent
      b, a, r, s = resp[0].values_at('b', 'a', 'r', 's')
      Rails.logger.info("Creating fieldUpdateComment for building: #{b}, application: #{a}, repsonse: #{r}, email send date: #{s}")

      header = { 'Content-Type' => 'application/json' }
      body = build_request_body(r, a, s)

      response = Force::Request.new(parse_response: true)
                               .post_with_headers("/fieldUpdateComment/#{a}", body, header)

      Rails.logger.info("response from salasforce when creating fieldUpdateComment is #{response.to_json}")

      if response.status == 404
        raise 'Salesforce response to POST /fieldUpdateComment returned a 404'
      end

      listing_id = listing_id_map(b)

      # when fieldupdatecomment is successfully created redirect with a response of y (yes) or n (no)
      redirect_to "/listing_interest?listing=#{listing_id}&response=#{r}"
    rescue JWT::ExpiredSignature
      Rails.logger.error('Token expired, not able to create fieldUpdateComment')
      decoded_expired_token = JWT.decode(token, secret, true,
                                         { verify_expiration: false })
      b = decoded_expired_token[0]['b']
      listing_id = listing_id_map(b)
      # when token is expired redirect with a response of x (expired)
      redirect_to "/listing_interest?listing=#{listing_id}&response=x"
    rescue StandardError => e
      Rails.logger.error("Error when creating fieldUpdateComment #{e}")
      # when there is an error redirect with a response of e (error)
      redirect_to "/listing_interest?listing=#{listing_id}&response=e"
    end
  end

  private

  def confirmation_params
    params.require(:t)
  end

  def listing_id_map(listing_number)
    array = %w[a0W0P00000DZYzVUAX a0W4U00000KnLRMUA3
               a0W4U00000IYEb4UAH a0W4U00000IYSM4UAP
               a0W4U00000Ih1V2UAJ a0W4U00000KnCZRUA3]
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
    end
  end

  def convet_date_format(date)
    date = Date.parse(date)
    date.strftime('%B %d, %Y')
  end

  def env_secret
    ENV['JWT_TOKEN_SECRET'] || ''
  end
end